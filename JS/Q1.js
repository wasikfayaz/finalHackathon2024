function countCharacters(str) {
    const charCount = {};

    for (let char of str) {
        charCount[char] = charCount[char] ? charCount[char] + 1 : 1;
    }

    return charCount;
}

// Example usage:
console.log(countCharacters("hello")); // { h: 1, e: 1, l: 2, o: 1 }
