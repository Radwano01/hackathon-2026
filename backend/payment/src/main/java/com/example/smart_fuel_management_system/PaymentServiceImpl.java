package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.*;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

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

                try {

                    // WALLET
                    if (method.paymentMethodType() == PaymentMethodType.WALLET) {

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
                    if (method.paymentMethodType() == PaymentMethodType.CARD) {

                        if (method.cardToken() == null) {
                            throw new RuntimeException("Missing card token");
                        }

                        boolean success = chargeWithStripe(
                                method.cardToken().toString(),
                                dto.amount()
                        );

                        if (!success) {
                            throw new RuntimeException("Stripe declined");
                        }

                        paid = true;
                        break;
                    }

                } catch (Exception e) {
                    System.out.println("Failed method: " + method.id() + " " + e.getMessage());
                }
            }

            // 4. UPDATE TRANSACTION STATUS
            if (paid) {

                restTemplate.patchForObject(
                        "http://TRANSACTION/api/v1/transactions/internal/{id}/status?status=SUCCESS",
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

                restTemplate.patchForObject(
                        "http://TRANSACTION/api/v1/transactions/internal/{id}/status?status=FAILED",
                        null,
                        Void.class,
                        tx.id()
                );

                throw new RuntimeException("All payment methods failed");
            }

        } catch (Exception e) {

            restTemplate.patchForObject(
                    "http://TRANSACTION/api/v1/transactions/internal/{id}/status?status=FAILED",
                    null,
                    Void.class,
                    tx.id()
            );

            throw e;
        }
    }

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
}