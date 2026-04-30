package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.AddCardDTO;
import com.example.smart_fuel_management_system.dto.PaymentMethodDTO;
import com.example.smart_fuel_management_system.dto.PaymentMethodPaymentDTO;
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
    public UUID addCard(UUID userId, AddCardDTO dto) {

        PaymentMethod existingDefault = repository.findByUserIdAndIsDefaultTrue(userId);

        // must come from visa system but for now this fine
        UUID cardToken = UUID.fromString("tok_" + UUID.randomUUID());
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

        return repository.save(method).getId();
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
                        pm.getPriority(),
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
                        pm.getPriority(),
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

    @Override
    public void updatePriority(UUID userId, UUID methodId, int priority) {

        PaymentMethod method = repository.findById(methodId)
                .orElseThrow();

        if (!method.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        method.setPriority(priority);
        repository.save(method);
    }
}