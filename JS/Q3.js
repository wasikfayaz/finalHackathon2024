function sortNumbers(numbers) {
    return numbers.slice().sort((a, b) => a - b);
}

// Example usage:
console.log(sortNumbers([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5])); // [ 1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9 ]
