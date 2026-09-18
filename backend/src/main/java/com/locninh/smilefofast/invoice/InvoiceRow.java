package com.locninh.smilefofast.invoice;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record InvoiceRow(
        String folioNum,
        String folioSubNum,
        String balanceCode,
        String taxCode,

        String billSeri1,
        String billSeri2,

        String billNumber1From,
        String billNumber1To,
        String billNumber2From,
        String billNumber2To,

        String billId,
        String billInfor,

        String companyName,
        String address1,
        String vatCode,
        String guestName,

        BigDecimal totalAmount,
        BigDecimal subAmount,
        BigDecimal serviceCharge,
        BigDecimal taxAmount,

        LocalDateTime printDate,
        String printCashier,

        BigDecimal exRate,

        Integer printSumaryFlag,
        Integer postToGL,
        Integer printStyle,

        String billNote,

        LocalDateTime invDate,
        LocalDateTime arrivalDate,
        LocalDateTime departureDate,

        String roomCode,
        String clientMail,
        String taAddress3,

        String modeOfPayment
) {
}