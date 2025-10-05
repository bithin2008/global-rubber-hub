import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Custom validator for Indian PAN (Permanent Account Number)
 * PAN format: 5 letters + 4 digits + 1 letter
 * Example: ABCDE1234F
 */
export function panValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Let required validator handle empty values
    }

    const pan = control.value.toString().trim().toUpperCase();
    
    // PAN should be exactly 10 characters
    if (pan.length !== 10) {
      return { panLength: { value: control.value } };
    }

    // PAN pattern: 5 letters + 4 digits + 1 letter
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    
    if (!panPattern.test(pan)) {
      return { panPattern: { value: control.value } };
    }

    // Additional validation: First 5 characters should be letters
    const firstFive = pan.substring(0, 5);
    if (!/^[A-Z]{5}$/.test(firstFive)) {
      return { panFirstFive: { value: control.value } };
    }

    // Middle 4 characters should be digits
    const middleFour = pan.substring(5, 9);
    if (!/^[0-9]{4}$/.test(middleFour)) {
      return { panMiddleFour: { value: control.value } };
    }

    // Last character should be a letter
    const lastChar = pan.substring(9, 10);
    if (!/^[A-Z]{1}$/.test(lastChar)) {
      return { panLastChar: { value: control.value } };
    }

    return null; // Valid PAN
  };
}

/**
 * Helper function to format PAN input (auto-uppercase and limit length)
 */
export function formatPanInput(value: string): string {
  if (!value) return '';
  
  // Remove any non-alphanumeric characters
  const cleaned = value.replace(/[^A-Za-z0-9]/g, '');
  
  // Convert to uppercase
  const upper = cleaned.toUpperCase();
  
  // Limit to 10 characters
  return upper.substring(0, 10);
}

/**
 * Helper function to validate PAN format in real-time
 */
export function isValidPanFormat(value: string): boolean {
  if (!value || value.length !== 10) return false;
  
  const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panPattern.test(value.toUpperCase());
}
