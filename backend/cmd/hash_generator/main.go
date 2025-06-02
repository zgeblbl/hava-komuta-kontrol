package main

import (
    "fmt"
    "golang.org/x/crypto/bcrypt"
)

func main() {
    // Test edilecek şifreler
    passwords := []string{
        "test123",
        "admin123",
        "password123",
        "123456",
        "admin",
        "komutakontrol123",
    }

    // init.sql'deki mevcut hash
    existingHash := "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfQAANMQmHBpC.m"

    // Her şifreyi dene
    for _, password := range passwords {
        fmt.Printf("\nŞifre deneniyor: %s\n", password)
        
        // Yeni bir hash oluştur
        hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 12)
        if err != nil {
            fmt.Printf("Hata oluştu: %v\n", err)
            continue
        }

        fmt.Printf("Yeni oluşturulan hash: %s\n", string(hashedPassword))
        
        // Mevcut hash ile şifreyi doğrula
        err = bcrypt.CompareHashAndPassword([]byte(existingHash), []byte(password))
        if err != nil {
            fmt.Printf("Bu şifre veritabanındaki hash ile eşleşmiyor!\n")
        } else {
            fmt.Printf("✓ BU ŞİFRE DOĞRU: %s\n", password)
            return
        }
    }
    
    fmt.Println("\nHiçbir şifre eşleşmedi!")
} 