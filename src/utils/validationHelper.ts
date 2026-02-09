import createHttpError from 'http-errors'

/**
 * Validates if a string parameter is a valid numeric ID
 * @returns The parsed number if valid, throws error if invalid
 */
export function validateNumericId(id: string): number {
    const parsedId = Number(id)
    if (Number.isNaN(parsedId)) {
        throw createHttpError(400, 'Invalid url param.')
    }
    return parsedId
}
