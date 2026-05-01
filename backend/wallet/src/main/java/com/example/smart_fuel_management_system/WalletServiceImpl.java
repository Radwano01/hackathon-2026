package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.WalletBonusDTO;
import com.example.smart_fuel_management_system.dto.WalletDTO;
import com.example.smart_fuel_management_system.dto.WalletUpdateDTO;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;

    @Autowired
    public WalletServiceImpl(WalletRepository walletRepository) {
        this.walletRepository = walletRepository;
    }

    // ============== USER OPERATIONS ==============

    @Override
    public WalletDTO getWalletDetails(UUID userId) {
        Wallet wallet = getWalletByUserId(userId);
        return WalletDTO.builder()
                .balance(wallet.getBalance())
                .currency(wallet.getCurrency())
                .build();
    }

    @Override
    @Transactional
    public void updateBalance(UUID userId, WalletUpdateDTO request) {
        Wallet wallet = walletRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new EntityNotFoundException("User wallet not found"));

        switch (request.type()) {
            case TOP_UP, REFUND, BONUS -> wallet.credit(request.amount());
            case WITHDRAW -> wallet.debit(request.amount());
        }

        walletRepository.save(wallet);
    }

    @Override
    public void deactivateWallet(UUID userId) {
        Wallet wallet = getWalletByUserId(userId);
        validateStatusChange(wallet.getStatusType(), "Cannot deactivate");
        wallet.setStatusType(StatusType.INACTIVE);
        walletRepository.save(wallet);
    }

    // ============== ADMIN OPERATIONS ==============

    @Override
    public void activateWallet(UUID userId) {
        Wallet wallet = getWalletByUserId(userId);
        if (!wallet.getStatusType().equals(StatusType.INACTIVE)) {
            throw new EntityExistsException("Wallet is not in inactive state. Current status: " + wallet.getStatusType());
        }
        wallet.setStatusType(StatusType.ACTIVE);
        walletRepository.save(wallet);
    }

    @Override
    public void blockWallet(UUID userId) {
        Wallet wallet = getWalletByUserId(userId);
        if (wallet.getStatusType().equals(StatusType.BLOCKED)) {
            throw new EntityExistsException("Wallet is already blocked");
        }
        wallet.setStatusType(StatusType.BLOCKED);
        walletRepository.save(wallet);
    }

    // ============== INTERNAL OPERATIONS ==============

    @Override
    public void createWallet(UUID userId) {
        Wallet wallet = new Wallet(
                BigDecimal.ZERO,
                "$",
                StatusType.ACTIVE,
                userId,
                LocalDateTime.now()
        );
        walletRepository.save(wallet);
    }

    @Override
    public void applyBonus(WalletBonusDTO request) {
        Wallet wallet = getWalletByUserId(request.userId());
        wallet.credit(request.amount());
        walletRepository.save(wallet);
    }

    // ============== HELPER METHODS ==============

    private Wallet getWalletByUserId(UUID userId) {
        return walletRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("User wallet not found"));
    }

    /**
     * Validates that wallet status allows transitions (not already in blocked/inactive state)
     */
    private void validateStatusChange(StatusType currentStatus, String action) {
        if (currentStatus.equals(StatusType.BLOCKED)) {
            throw new EntityExistsException(action + ": Wallet is blocked");
        }
        if (currentStatus.equals(StatusType.INACTIVE)) {
            throw new EntityExistsException(action + ": Wallet is already inactive");
        }
    }
}
