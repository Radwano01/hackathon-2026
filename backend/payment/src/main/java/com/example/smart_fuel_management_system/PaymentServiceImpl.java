package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.*;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
<<<<<<< HEAD
=======
import org.springframework.http.HttpMethod;
>>>>>>> a114d8b (readme added)
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

        // 1. CREATE TRANSACTION (ONLY HERE)
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

            // 2. GET PAYMENT METHODS
<<<<<<< HEAD
            PaymentMethodDTO[] methods = restTemplate.getForObject(
                    "http://PAYMENT-METHOD/api/v1/payment-methods/internal/{userId}",
                    PaymentMethodDTO[].class,
                    userId
            );

            if (methods == null || methods.length == 0) {
                throw new RuntimeException("No payment methods");
            }

            List<PaymentMethodDTO> sorted = Arrays.stream(methods)
                    .sorted(Comparator.comparingInt(PaymentMethodDTO::priority))
                    .toList();

            // 3. TRY PAYMENT METHODS
            for (PaymentMethodDTO method : sorted) {
=======
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> methods = restTemplate.getForObject(
                    "http://PAYMENT-METHOD/api/v1/payment-methods/internal/{userId}",
                    List.class,
                    userId
            );

            if (methods == null || methods.isEmpty()) {
                throw new RuntimeException("No payment methods");
            }

            List<Map<String, Object>> sorted = methods.stream()
                    .sorted(Comparator.comparingInt(m -> (Integer) m.getOrDefault("priority", Integer.MAX_VALUE)))
                    .toList();

            // 3. TRY PAYMENT METHODS
            for (Map<String, Object> method : sorted) {
>>>>>>> a114d8b (readme added)

                try {
                    String methodType = (String) method.get("paymentMethodType");
                    Object cardTokenObj = method.get("cardToken");

                    // WALLET
<<<<<<< HEAD
                    if (method.paymentMethodType() == PaymentMethodType.WALLET) {
=======
                    if ("WALLET".equals(methodType)) {
>>>>>>> a114d8b (readme added)

                        restTemplate.postForObject(
                                "http://WALLET/api/v1/wallet/internal/{userId}/update",
                                new WalletUpdateDTO(dto.amount(), TransactionType.WITHDRAW),
                                Void.class,
                                userId
                        );

                        paid = true;
                        break;
                    }

                    // STRIPE CARD
<<<<<<< HEAD
                    if (method.paymentMethodType() == PaymentMethodType.CARD) {
=======
                    if ("CARD".equals(methodType)) {
>>>>>>> a114d8b (readme added)

                        if (cardTokenObj == null) {
                            throw new RuntimeException("Missing card token");
                        }

                        boolean success = chargeWithStripe(
<<<<<<< HEAD
                                method.cardToken().toString(),
=======
                                cardTokenObj.toString(),
>>>>>>> a114d8b (readme added)
                                dto.amount()
                        );

                        if (!success) {
                            throw new RuntimeException("Stripe declined");
                        }

                        paid = true;
                        break;
                    }

                } catch (Exception e) {
<<<<<<< HEAD
                    System.out.println("Failed method: " + method.id() + " " + e.getMessage());
=======
                    System.out.println("Failed method: " + method.get("id") + " " + e.getMessage());
>>>>>>> a114d8b (readme added)
                }
            }

            // 4. UPDATE TRANSACTION STATUS
            if (paid) {

<<<<<<< HEAD
                restTemplate.patchForObject(
                        "http://TRANSACTION/api/v1/transactions/internal/{id}/status?status=SUCCESS",
=======
                restTemplate.exchange(
                        "http://TRANSACTION/api/v1/transactions/internal/{id}/status?status=SUCCESS",
                        HttpMethod.PATCH,
>>>>>>> a114d8b (readme added)
                        null,
                        Void.class,
                        tx.id()
                );

                return new PaymentResponse(
                        tx.id(),
                        PaymentStatusType.SUCCESS,
                        dto.amount()
                );

            } else {

<<<<<<< HEAD
                restTemplate.patchForObject(
                        "http://TRANSACTION/api/v1/transactions/internal/{id}/status?status=FAILED",
=======
                restTemplate.exchange(
                        "http://TRANSACTION/api/v1/transactions/internal/{id}/status?status=FAILED",
                        HttpMethod.PATCH,
>>>>>>> a114d8b (readme added)
                        null,
                        Void.class,
                        tx.id()
                );

                throw new RuntimeException("All payment methods failed");
            }

        } catch (Exception e) {

<<<<<<< HEAD
            restTemplate.patchForObject(
                    "http://TRANSACTION/api/v1/transactions/internal/{id}/status?status=FAILED",
=======
            restTemplate.exchange(
                    "http://TRANSACTION/api/v1/transactions/internal/{id}/status?status=FAILED",
                    HttpMethod.PATCH,
>>>>>>> a114d8b (readme added)
                    null,
                    Void.class,
                    tx.id()
            );

            throw e;
        }
    }

    private boolean chargeWithStripe(String paymentMethodId, BigDecimal amount) {
<<<<<<< HEAD

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
=======

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

    @Override
    public PaymentEligibilityResponse checkEligibility(UUID userId, BigDecimal estimatedAmount) {

        PaymentMethodDTO[] methods = restTemplate.getForObject(
                "http://PAYMENT-METHOD/api/v1/payment-methods/internal/{userId}",
                PaymentMethodDTO[].class,
                userId
        );

        if (methods == null || methods.length == 0) {
            return new PaymentEligibilityResponse(
                    false,
                    "No payment methods found"
            );
        }

        boolean hasValidMethod = Arrays.stream(methods)
                .anyMatch(method -> {

                    PaymentMethodType type = method.paymentMethodType();

                    if (type == PaymentMethodType.WALLET) {
                        return true; // later you can check wallet balance here
                    }

                    if (type == PaymentMethodType.CARD) {
                        return method.cardToken() != null;
                    }

                    return false;
                });

        if (!hasValidMethod) {
            return new PaymentEligibilityResponse(
                    false,
                    "No valid payment method available"
            );
        }

        return new PaymentEligibilityResponse(true, "OK");
>>>>>>> a114d8b (readme added)
    }
}