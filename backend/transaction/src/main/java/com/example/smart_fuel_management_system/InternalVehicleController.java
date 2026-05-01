package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.TransactionDTO;
import com.example.smart_fuel_management_system.dto.TransactionResponse;
import com.example.smart_fuel_management_system.enums.TransactionStatusType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/transactions/internal")
public class InternalVehicleController {

    private final TransactionService transactionService;

    public InternalVehicleController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }


    @PostMapping("/{userId}")
    public ResponseEntity<TransactionResponse> internalCreateTransaction(
            @PathVariable UUID userId,
            @RequestBody TransactionDTO transactionDTO) {
        return ResponseEntity.ok(
                transactionService.create(userId, transactionDTO)
        );
    }

    @PatchMapping("/{transactionId}/status")
    public ResponseEntity<Void> internalUpdateStatus(
            @PathVariable UUID transactionId,
            @RequestParam TransactionStatusType transactionStatusType) {
        transactionService.update(transactionId, transactionStatusType);
        return ResponseEntity.ok().build();
    }
}
