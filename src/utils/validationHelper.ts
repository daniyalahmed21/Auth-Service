import createHttpError from 'http-errors'

/**
 * Validates if a parameter is a valid numeric ID
 * Handles string, string[], or undefined from Express req.params
 * @returns The parsed number if valid, throws error if invalid
 */
export function validateNumericId(id: string | string[] | undefined): number {
    if (!id || Array.isArray(id)) {
        throw createHttpError(400, 'Invalid url param.')
    }
    const parsedId = Number(id)
    if (Number.isNaN(parsedId) || !Number.isInteger(parsedId)) {
        throw createHttpError(400, 'Invalid url param.')
    }
    return parsedId
}
