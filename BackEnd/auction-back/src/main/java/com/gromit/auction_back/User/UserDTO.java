package com.gromit.auction_back.User;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int userCode;
    private String id;
    private String password;
    private String name;
    private String email;
    private String phone;
    private LocalDate birthDate;
    private String address;
    private int cash;
    private String gender;
    private String isAdult;
    private String isAdmin;
    private String nickname;
    private String isSuspended;

}