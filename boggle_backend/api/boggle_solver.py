import sys

from .randomGen import random_grid
from .readJSONFile import read_json_to_list


class Boggle:
    def __init__(self, grid, dictionary):
        self.grid = grid
        self.dictionary = dictionary if isinstance(dictionary, list) else []

    def getSolution(self):
        if not self.grid or not self.dictionary:
            return []

        size = len(self.grid)

        for row in self.grid:
            if len(row) != size:
                return []

        grid = [[cell.lower() for cell in row] for row in self.grid]
        words = [word.lower() for word in self.dictionary if len(word) >= 3]
        solutions = []

        for word in words:
            if self.word_exists(grid, word):
                solutions.append(word)

        return sorted(list(set(solutions)))

    def word_exists(self, grid, word):
        size = len(grid)

        for row in range(size):
            for col in range(size):
                if self.search_from_cell(grid, word, row, col, set()):
                    return True

        return False

    def search_from_cell(self, grid, word, row, col, visited):
        size = len(grid)

        if not word:
            return True

        if row < 0 or row >= size or col < 0 or col >= size:
            return False

        if (row, col) in visited:
            return False

        cell = grid[row][col]

        if not word.startswith(cell):
            return False

        visited.add((row, col))
        remaining_word = word[len(cell):]

        directions = [
            (-1, -1), (-1, 0), (-1, 1),
            (0, -1),           (0, 1),
            (1, -1),  (1, 0),  (1, 1),
        ]

        for row_change, col_change in directions:
            next_row = row + row_change
            next_col = col + col_change

            if self.search_from_cell(
                grid,
                remaining_word,
                next_row,
                next_col,
                visited,
            ):
                return True

        visited.remove((row, col))
        return False


def main():
    size = int(sys.argv[1])
    grid = random_grid(size)

    filename = "boggle_backend/static/data/full-wordlist.json"
    dictionary = read_json_to_list(filename)

    game = Boggle(grid, dictionary)

    print("Grid:")
    for row in grid:
        print(row)

    print("\nSolutions:")
    print(game.getSolution())


if __name__ == "__main__":
    main()