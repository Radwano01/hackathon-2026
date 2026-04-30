package com.example.smart_fuel_management_system;

public class CardUtils {

    public static String mask(String cardNumber) {
        return "**** **** **** " + cardNumber.substring(cardNumber.length() - 4);
    }
}