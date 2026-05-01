package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.*;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final RestTemplate restTemplate;

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    public PaymentServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // =========================
    // INIT STRIPE
    // =========================
    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    // =========================
    // MAIN PAYMENT FLOW
    // =========================
    @Override
    public PaymentResponse pay(UUID userId, PaymentDTO dto) {

        TransactionResponse tx = restTemplate.postForObject(
                "http://TRANSACTION/api/v1/transactions/internal/" + userId,
                new TransactionDTO(dto.amount(), dto.orderId()),
                TransactionResponse.class
        );

        if (tx == null) {
            throw new RuntimeException("Transaction creation failed");
        }

        boolean paid = false;

        try {

            // =========================
            // 1. GET PAYMENT METHODS
            // =========================
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> methods = restTemplate.getForObject(
                    "http://PAYMENT-METHOD/api/v1/payment-methods/internal/{userId}",
                    List.class,
                    userId
            );

            if (methods == null || methods.isEmpty()) {
                throw new RuntimeException("No payment methods");
            }

            // =========================
            // 2. GET PREFERENCE SERVICE (EUREKA)
            // =========================
            PaymentPreferenceDTO preference = restTemplate.getForObject(
                    "http://PAYMENT-PREFERENCE-SERVICE/api/v1/payment-preferences/{userId}",
                    PaymentPreferenceDTO.class,
                    userId
            );

            // =========================
            // 3. DECISION ENGINE
            // =========================

            if (preference != null && preference.preferredType() == PreferredType.WALLET) {

                paid = payWithWallet(userId, dto.amount());
            }

            else if (preference != null && preference.preferredType() == PreferredType.CARD) {

                paid = payWithSpecificCard(methods, preference.preferredCardId(), dto.amount());
            }

            else {

                paid = fallbackPayment(methods, dto.amount());
            }

            // =========================
            // 4. UPDATE TRANSACTION
            // =========================
            updateTransaction(tx.id(), paid);

            if (!paid) {
                throw new RuntimeException("Payment failed");
            }

            return new PaymentResponse(
                    tx.id(),
                    PaymentStatusType.SUCCESS,
                    dto.amount()
            );

        } catch (Exception e) {

            updateTransaction(tx.id(), false);
            throw e;
        }
    }

    // =========================
    // WALLET PAYMENT
    // =========================
    private boolean payWithWallet(UUID userId, BigDecimal amount) {

        try {
            restTemplate.postForObject(
                    "http://WALLET/api/v1/wallet/internal/{userId}/update",
                    new WalletUpdateDTO(amount, TransactionType.WITHDRAW),
                    Void.class,
                    userId
            );
            return true;
        } catch (Exception e) {
            System.out.println("Wallet payment failed: " + e.getMessage());
            return false;
        }
    }

    // =========================
    // CARD PAYMENT (SPECIFIC)
    // =========================
    private boolean payWithSpecificCard(List<Map<String, Object>> methods,
                                        UUID cardId,
                                        BigDecimal amount) {

        try {
            for (Map<String, Object> method : methods) {

                if (cardId.toString().equals(String.valueOf(method.get("id")))) {

                    String token = (String) method.get("cardToken");

                    return chargeWithStripe(token, amount);
                }
            }
        } catch (Exception e) {
            System.out.println("Card payment failed: " + e.getMessage());
        }

        return false;
    }

    // =========================
    // FALLBACK PAYMENT FLOW
    // =========================
    private boolean fallbackPayment(List<Map<String, Object>> methods,
                                    BigDecimal amount) {

        List<Map<String, Object>> sorted = methods.stream()
                .sorted(Comparator.comparingInt(
                        m -> (Integer) m.getOrDefault("priority", Integer.MAX_VALUE)
                ))
                .toList();

        for (Map<String, Object> method : sorted) {

            try {
                String type = (String) method.get("paymentMethodType");

                if ("WALLET".equals(type)) {
                    if (payWithWallet(UUID.fromString((String) method.get("userId")), amount)) {
                        return true;
                    }
                }

                if ("CARD".equals(type)) {

                    String token = (String) method.get("cardToken");

                    if (token != null && chargeWithStripe(token, amount)) {
                        return true;
                    }
                }

            } catch (Exception e) {
                System.out.println("Fallback method failed: " + e.getMessage());
            }
        }

        return false;
    }

    // =========================
    // STRIPE CHARGE
    // =========================
    private boolean chargeWithStripe(String paymentMethodId, BigDecimal amount) {

        try {
            PaymentIntentCreateParams params =
                    PaymentIntentCreateParams.builder()
                            .setAmount(amount.multiply(BigDecimal.valueOf(100)).longValue())
                            .setCurrency("usd")
                            .setPaymentMethod(paymentMethodId)
                            .setConfirm(true)
                            .build();

            PaymentIntent intent = PaymentIntent.create(params);

            return "succeeded".equals(intent.getStatus());

        } catch (Exception e) {
            System.out.println("Stripe error: " + e.getMessage());
            return false;
        }
    }

    // =========================
    // TRANSACTION UPDATE
    // =========================
    private void updateTransaction(UUID txId, boolean success) {

        String status = success ? "SUCCESS" : "FAILED";

        restTemplate.exchange(
                "http://TRANSACTION/api/v1/transactions/internal/{id}/status?status=" + status,
                HttpMethod.PATCH,
                null,
                Void.class,
                txId
        );
    }

    // =========================
    // ELIGIBILITY CHECK
    // =========================
    @Override
    public PaymentEligibilityResponse checkEligibility(UUID userId, BigDecimal estimatedAmount) {

        PaymentMethodDTO[] methods = restTemplate.getForObject(
                "http://PAYMENT-METHOD/api/v1/payment-methods/internal/{userId}",
                PaymentMethodDTO[].class,
                userId
        );

        if (methods == null || methods.length == 0) {
            return new PaymentEligibilityResponse(false, "No payment methods found");
        }

        boolean hasValid = Arrays.stream(methods)
                .anyMatch(m -> m.paymentMethodType() == PaymentMethodType.WALLET
                        || m.cardToken() != null);

        return new PaymentEligibilityResponse(hasValid, hasValid ? "OK" : "No valid method");
    }
}