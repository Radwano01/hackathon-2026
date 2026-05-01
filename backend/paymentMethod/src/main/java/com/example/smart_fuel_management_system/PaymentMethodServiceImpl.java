package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.AddCardDTO;
import com.example.smart_fuel_management_system.dto.PaymentMethodDTO;
import com.example.smart_fuel_management_system.dto.PaymentMethodPaymentDTO;
import jakarta.persistence.EntityExistsException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PaymentMethodServiceImpl implements PaymentMethodService {

    private final PaymentMethodRepository repository;

    public PaymentMethodServiceImpl(PaymentMethodRepository repository) {
        this.repository = repository;
    }

    @Override
    public void addCard(UUID userId, AddCardDTO dto) {

        if (dto.cardNumber().length() < 12) {
            throw new IllegalArgumentException("Card number too short");
        }

        // FIXED: compare masked or token in real systems (not raw card)
        if (repository.existsByCardNumberMasked(CardUtils.mask(dto.cardNumber()))) {
            throw new EntityExistsException("This card already exists");
        }

        PaymentMethod existingDefault =
                repository.findByUserIdAndIsDefaultTrue(userId);

        String cardToken = "tok_" + UUID.randomUUID();

        PaymentMethod method = new PaymentMethod(
                userId,
                PaymentMethodType.CARD,
                dto.cardHolderName(),
                cardToken,
                CardUtils.mask(dto.cardNumber()),
                dto.expiryDate()
        );

        // first card becomes default
        method.setDefault(existingDefault == null);

        repository.save(method);
    }

    @Override
    public List<PaymentMethodDTO> list(UUID userId) {
        return repository.findByUserId(userId)
                .stream()
                .map(pm -> new PaymentMethodDTO(
                        pm.getId(),
                        pm.getType(),
                        pm.getCardHolderName(),
                        pm.getCardNumberMasked(),
                        pm.isDefault()
                ))
                .toList();
    }

    @Override
    public List<PaymentMethodPaymentDTO> internalList(UUID userId) {
        return repository.findByUserId(userId)
                .stream()
                .map(pm -> new PaymentMethodPaymentDTO(
                        pm.getId(),
                        pm.getType(),
                        pm.getCardToken(),
                        pm.isDefault()
                ))
                .toList();
    }

    @Override
    public void delete(UUID userId, UUID methodId) {
        repository.deleteByIdAndUserId(methodId, userId);
    }

    @Override
    public void setDefault(UUID userId, UUID methodId) {

        List<PaymentMethod> methods = repository.findByUserId(userId);

        for (PaymentMethod pm : methods) {
            pm.setDefault(pm.getId().equals(methodId));
        }

        repository.saveAll(methods);
    }
}