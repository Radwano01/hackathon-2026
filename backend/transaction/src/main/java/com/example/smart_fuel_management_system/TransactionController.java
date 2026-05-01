package com.example.smart_fuel_management_system;
import com.example.smart_fuel_management_system.dto.TransactionDTO;
import com.example.smart_fuel_management_system.dto.TransactionResponse;
import com.example.smart_fuel_management_system.enums.TransactionStatusType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }


    //user page
    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getByUser(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(
                transactionService.getByUserId(userId)
        );
    }

    //user page
    @GetMapping("/{transactionId}")
    public ResponseEntity<TransactionResponse> getById(@PathVariable UUID transactionId) {
        return ResponseEntity.ok(
                transactionService.getById(transactionId)
        );
    }
}
