package com.example.smart_fuel_management_system;

public class CardUtils {

    public static String mask(String cardNumber) {

        if (cardNumber == null) {
            return null;
        }

        String trimmed = cardNumber.replaceAll("\\s+", "");

        if (trimmed.length() < 4) {
            return "INVALID";
        }

        return "**** **** **** " + trimmed.substring(trimmed.length() - 4);
    }
}