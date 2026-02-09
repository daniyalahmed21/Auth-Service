import { describe, it, expect } from 'vitest'
import createHttpError from 'http-errors'
import { validateNumericId } from '../../src/utils/validationHelper.js'

describe('validateNumericId', () => {
    it('should return a number when given a valid string number', () => {
        expect(validateNumericId('123')).toBe(123)
        expect(validateNumericId('0')).toBe(0)
        expect(validateNumericId('999')).toBe(999)
    })

    it('should throw 400 error when given undefined', () => {
        expect(() => validateNumericId(undefined)).toThrow(
            createHttpError(400, 'Invalid url param.')
        )
    })

    it('should throw 400 error when given an array', () => {
        expect(() => validateNumericId(['123', '456'])).toThrow(
            createHttpError(400, 'Invalid url param.')
        )
        expect(() => validateNumericId([])).toThrow(
            createHttpError(400, 'Invalid url param.')
        )
    })

    it('should throw 400 error when given a non-numeric string', () => {
        expect(() => validateNumericId('abc')).toThrow(
            createHttpError(400, 'Invalid url param.')
        )
        expect(() => validateNumericId('12.34')).toThrow(
            createHttpError(400, 'Invalid url param.')
        )
        expect(() => validateNumericId('')).toThrow(
            createHttpError(400, 'Invalid url param.')
        )
    })
})
