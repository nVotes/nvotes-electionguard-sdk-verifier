import { util, eio, arithm } from '../../vendors/vjsc/vjsc-1.1.1';

/**
 * Type predicate that returns whether the object is null
 * and narrows the type to either as null or the alternative
 * type in a nested code block.
 * 
 * @param obj obj we want to differentiate the type of
 */
export function isNull(obj: any | null): obj is null {
    return obj !== null;
}

/**
 * Type predicate that returns whether the object is an error
 * and narrows the type to either an error or the alternative
 * type in a nested code block.
 * 
 * @param obj obj we want to differentiate the type of
 */
export function isError(obj: any | Error): obj is Error {
    return obj instanceof Error;
}

/**
 * Receives a string of a number in decimal base and returns it in 
 * hexadecimal base, also as a string.
 * 
 * @param decLiStr A decimal large integer number either as a string
 *                   or as a native typescript number.
 */
export function strDecToHex(decLiStr: string | number): string {
    return BigInt(decLiStr).toString(16);
}

/**
 * Receives a string of a number in decimal base and returns it as
 * a byte array.
 * @param decLiStr A decimal large integer number either as a string
 *                   or as a native typescript number.
 */
export function strDecToByteArray(
    decLiStr: string | number
): Uint8Array {
    return util.hexToByteArray(BigInt(decLiStr).toString(16));
}

/**
 * Converts a number as a string into a byte tree of the correct size.
 * 
 * @param decLiStr A decimal large integer number either as a string
 *                   or as a native typescript number.
 * @param treeSize Required size in bytes of the returned ByteTree
 */
export function strDecToByteTree(
    decLiStr: string | number,
    treeSize: number
): eio.ByteTree | Error {
    let hex = strDecToHex(decLiStr); 

    // First make it even so that byte length calculations work
    if (hex.length % 2 == 1) {
        hex = "0" + hex;
    }

    // Check that the number is not bigger than the expected tree size
    if (hex.length / 2 > treeSize) {
        return new Error("Number is too big for encoding");
    }

    // The padding size is otherwise the number of extra zeros we
    // require to have the appropiate number of bytes
    let padding_size = treeSize - hex.length / 2;
    for (var i = 0; i < padding_size; i++) {
        hex = "00" + hex;
    }

    return eio.ByteTree.asByteTree(util.hexToByteArray(hex));
}

/**
 * Converts a number as a string into a ModPGroupElement.
 * 
 * @param decLiStr A decimal large integer number either as a string
 *                   or as a native typescript number.
 * @param modPGroup The multiplicative modular group to be used.
 */
export function strDecToModPGroupElement(
    decLiStr: string | number,
    modPGroup: arithm.ModPGroup
): arithm.ModPGroupElement | Error
{
    // First convert it to byte tree, dealing with errors if any
    let byteTree = strDecToByteTree(
        decLiStr,
        modPGroup.modulusByteLength
    );

    if (isError(byteTree)) { 
        const error: Error = byteTree;
        return error;
    } 
        
    // Then convert it to a group element, dealing with errors if any
    let element: arithm.ModPGroupElement;
    try {
        element = modPGroup.toElement(byteTree);
    } catch(error) {
        return error;
    }

    return element;
}

/**
 * Returns the string without any spaces
 * @param str input string
 */
export function removeSpaces(str: string): string {
    return str.replace(/[ \t\n]/g, "");
}
