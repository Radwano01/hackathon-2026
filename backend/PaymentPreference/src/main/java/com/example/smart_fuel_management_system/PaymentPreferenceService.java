package com.example.smart_fuel_management_system;

import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class PaymentPreferenceService {

    private final PaymentPreferenceRepository repository;

    public PaymentPreferenceService(PaymentPreferenceRepository repository) {
        this.repository = repository;
    }

    public PaymentPreferenceDTO get(UUID userId) {
        PaymentPreference paymentPreference =  repository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Not valid"));

        return PaymentPreferenceDTO.builder()
                .userId(paymentPreference.getUserId())
                .preferredCardId(paymentPreference.getPreferredCardId())
                .preferredType(paymentPreference.getPreferredType())
                .build();
    }

    public PaymentPreference setWalletPreferred(UUID userId) {
        return save(userId, PreferredType.WALLET, null);
    }

    public PaymentPreference setCardPreferred(UUID userId, UUID cardId) {
        return save(userId, PreferredType.CARD, cardId);
    }

    private PaymentPreference save(UUID userId,
                                   PreferredType type,
                                   UUID cardId) {

        PaymentPreference pref = repository.findById(userId)
                .orElse(new PaymentPreference());

        pref.setUserId(userId);
        pref.setPreferredType(type);
        pref.setPreferredCardId(cardId);

        return repository.save(pref);
    }

    private PaymentPreference createDefault(UUID userId) {
        PaymentPreference pref = new PaymentPreference();
        pref.setUserId(userId);
        pref.setPreferredType(PreferredType.WALLET); // safe default
        return repository.save(pref);
    }
}