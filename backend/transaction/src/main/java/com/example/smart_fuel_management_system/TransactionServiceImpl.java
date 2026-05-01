package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.*;
import com.example.smart_fuel_management_system.enums.TransactionStatusType;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final RestTemplate restTemplate;

    @Autowired
    public TransactionServiceImpl(TransactionRepository transactionRepository,
                                  RestTemplate restTemplate) {
        this.transactionRepository = transactionRepository;
        this.restTemplate = restTemplate;
    }

    public TransactionResponse create(UUID userId, TransactionDTO transactionDTO) {



        Transaction transaction = new Transaction(
                userId,
                TransactionStatusType.PENDING,
                transactionDTO.stationId()
        );

        transaction.setVehicleId(transactionDTO.vehicleId());
        transaction.setPlateNumber(transactionDTO.plateNumber());

        transactionRepository.save(transaction);

        return TransactionResponse.builder()
                .id(transaction.getId())
                .amount(transaction.getAmount())
                .status(transaction.getStatus())
                .build();
    }

    @Override
    public void update(UUID transactionId, TransactionStatusType transactionStatusType) {

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new EntityNotFoundException("Transaction not found"));

<<<<<<< HEAD

=======
        transaction.setStatus(transactionStatusType);
>>>>>>> a114d8b (readme added)
        transactionRepository.save(transaction);

        //BONUS TRIGGER
        if (transactionStatusType == TransactionStatusType.SUCCESS) {

            BigDecimal bonus = transaction.getAmount()
                    .multiply(BigDecimal.valueOf(0.05));

            BonusDTO bonusDTO = new BonusDTO(
                    transaction.getUserId(),
                    bonus
            );

            restTemplate.postForObject(
                    "http://WALLET/api/v1/wallet/bonus",
                    bonusDTO,
                    Void.class
            );
        }
    }

    @Override
    public List<TransactionResponse> getByUserId(UUID UserId) {

        List<Transaction> transactions = transactionRepository.findByUserId(UserId);

        return transactions.stream()
                .map(tx -> TransactionResponse.builder()
                        .id(tx.getId())
                        .amount(tx.getAmount())
                        .status(tx.getStatus())
                        .build())
                .toList();
    }

    @Override
    public TransactionResponse getById(UUID transactionId) {

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new EntityNotFoundException("Transaction not found"));

        // STATION INFO
        StationResponseDTO station = restTemplate.getForObject(
<<<<<<< HEAD
                "http://STATION/api/v1/stations/{id}/internal",
=======
                "http://STATION/internal/stations/{id}",
>>>>>>> a114d8b (readme added)
                StationResponseDTO.class,
                transaction.getReferenceId()
        );

        return TransactionResponse.builder()
                .id(transaction.getId())
                .amount(transaction.getAmount())
                .type(transaction.getType())
                .status(transaction.getStatus())
                .createdAt(transaction.getCreatedAt())

                // UI ENRICHMENT
                .stationName(station != null ? station.stationName() : null)
                .city(station != null ? station.city() : null)
                .vehiclePlateNumber(transaction.getPlateNumber())
                .paymentMethodType(transaction.getPaymentMethodType())

                .build();
    }
}
