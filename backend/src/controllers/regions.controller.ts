import { Request, Response } from 'express';
import { getRegionalConfig, REGIONAL_CONFIGS, getAvailablePlatforms } from '../config/regions';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHelpers';

/**
 * Get available countries for registration
 */
export const getAvailableCountries = async (req: Request, res: Response) => {
  try {
    const countries = Object.values(REGIONAL_CONFIGS).map(config => ({
      code: config.countryCode,
      name: config.countryName,
      currency: config.currency,
      languages: config.languages
    }));

    sendSuccessResponse(res, 'Available countries retrieved successfully', { countries });
  } catch (error) {
    sendErrorResponse(res, 500, 'Failed to retrieve countries', error);
  }
};

/**
 * Get regional configuration for a specific country
 */
export const getCountryConfig = async (req: Request, res: Response) => {
  try {
    const { countryCode } = req.params;
    
    if (!countryCode) {
      return sendErrorResponse(res, 400, 'Country code is required');
    }

    const config = getRegionalConfig(countryCode.toUpperCase());
    
    sendSuccessResponse(res, 'Country configuration retrieved successfully', { config });
  } catch (error) {
    if (error.message.includes('not found')) {
      sendErrorResponse(res, 404, 'Country not supported', error);
    } else {
      sendErrorResponse(res, 500, 'Failed to retrieve country configuration', error);
    }
  }
};

/**
 * Get available ride-hailing platforms for a country
 */
export const getCountryPlatforms = async (req: Request, res: Response) => {
  try {
    const { countryCode } = req.params;
    
    if (!countryCode) {
      return sendErrorResponse(res, 400, 'Country code is required');
    }

    const platforms = getAvailablePlatforms(countryCode.toUpperCase());
    
    sendSuccessResponse(res, 'Available platforms retrieved successfully', { platforms });
  } catch (error) {
    sendErrorResponse(res, 500, 'Failed to retrieve platforms', error);
  }
};

/**
 * Get available banking providers for a country
 */
export const getCountryBanks = async (req: Request, res: Response) => {
  try {
    const { countryCode } = req.params;
    
    if (!countryCode) {
      return sendErrorResponse(res, 400, 'Country code is required');
    }

    const config = getRegionalConfig(countryCode.toUpperCase());
    
    // Return banking providers with OAuth capabilities highlighted
    const banks = config.bankingProviders.map(bank => ({
      ...bank,
      integrationLevel: bank.oauthSupported ? 'full' : 'manual'
    }));
    
    sendSuccessResponse(res, 'Banking providers retrieved successfully', { 
      banks,
      paymentMethods: config.paymentMethods 
    });
  } catch (error) {
    sendErrorResponse(res, 500, 'Failed to retrieve banking providers', error);
  }
};

/**
 * Validate user data against country-specific formats
 */
export const validateCountryData = async (req: Request, res: Response) => {
  try {
    const { countryCode, data } = req.body;
    
    if (!countryCode || !data) {
      return sendErrorResponse(res, 400, 'Country code and data are required');
    }

    const config = getRegionalConfig(countryCode.toUpperCase());
    const validationResults = {
      phoneNumber: false,
      postalCode: false,
      driverLicense: false,
      vehicleRegistration: false
    };

    // Validate phone number
    if (data.phoneNumber) {
      validationResults.phoneNumber = config.phoneNumber.pattern.test(data.phoneNumber);
    }

    // Validate postal code
    if (data.postalCode) {
      validationResults.postalCode = config.postalCode.pattern.test(data.postalCode);
    }

    // Validate driver license
    if (data.driverLicense) {
      const licensePattern = new RegExp(config.regulatoryInfo.driverLicenseFormat);
      validationResults.driverLicense = licensePattern.test(data.driverLicense);
    }

    // Validate vehicle registration
    if (data.vehicleRegistration) {
      const vehiclePattern = new RegExp(config.regulatoryInfo.vehicleRegistrationFormat);
      validationResults.vehicleRegistration = vehiclePattern.test(data.vehicleRegistration);
    }

    const isValid = Object.values(validationResults).every(result => result !== false);

    sendSuccessResponse(res, 'Validation completed', { 
      isValid,
      results: validationResults,
      country: config.countryName
    });
  } catch (error) {
    sendErrorResponse(res, 500, 'Validation failed', error);
  }
};