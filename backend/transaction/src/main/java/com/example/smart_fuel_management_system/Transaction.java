package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.enums.PaymentMethodType;
import com.example.smart_fuel_management_system.enums.TransactionStatusType;
import com.example.smart_fuel_management_system.enums.TransactionType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    private UUID id = UUID.randomUUID();

    private UUID userId;
    private UUID vehicleId;
    private String plateNumber;

    private UUID referenceId; // 👈 FuelSessionId

    @Enumerated(EnumType.STRING)
    private PaymentMethodType paymentMethodType;

    @Enumerated(EnumType.STRING)
    private TransactionType type;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private TransactionStatusType status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // this contractor for creating stage
    public Transaction(UUID userId, TransactionStatusType transactionStatusType,
                       UUID referenceId) {
        this.userId = userId;
        this.status = transactionStatusType;
        this.referenceId = referenceId;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();


        this.paymentMethodType = PaymentMethodType.NONE;
        this.amount = BigDecimal.ZERO;
    }
}
