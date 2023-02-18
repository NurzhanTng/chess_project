import {Figure} from "./figures/Figure";
import {Board} from "./Board";
import {Colors} from "./Colors";

export class Cell {
    readonly x: number;
    readonly y: number;
    readonly color: Colors;
    figure: Figure | null;
    board: Board;
    available: boolean;
    id: number;

    constructor(board: Board, x: number, y: number, color: Colors, figure: Figure | null) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.figure = figure;
        this.board = board;
        this.available = false;
        this.id = Math.random()
    }

    isEmpty(): boolean {
        return this.figure === null;
    }

    isEnemy(target: Cell = this): boolean {
        if (target.figure)
            return this.figure?.color !== target.figure.color;
        return false;
    }

    isOverAttack(target: Cell): boolean {
        for (let i = 0; i < this.board.cells.length; i++) {
            for (let j = 0; j < this.board.cells[i].length; j++) {
                const cell: Cell = this.board.cells[i][j];

                if (cell.figure?.name === "Король" && this.isEnemy(cell)) {
                    const dx = Math.abs(cell.x - target.x)
                    const dy = Math.abs(cell.y - target.y)

                    if (dx <= 1 && dy <= 1)
                        return true;
                }

                else if (cell.figure?.name === "Пешка" && this.isEnemy(cell)) {
                    if (target.figure?.color === this.color)
                        return false;

                    const direction = cell.figure?.color === Colors.BLACK ? 1: -1

                    if (target.y === cell.y + direction && (target.x === cell.x + 1 || target.x === cell.x - 1))
                        return true;
                }
                
                else if (this.isEnemy(cell) && cell.figure?.canMove(target))
                    return true;
            }
        }
        return false;
    }

    isEmptyVertical(target: Cell): boolean {
        if (this.x !== target.x) {
            return false;
        }

        const min = Math.min(this.y, target.y);
        const max = Math.max(this.y, target.y);
        for (let y = min+1; y < max; y++) {
            if (!this.board.getCell(this.x, y).isEmpty()) {
                return false;
            }
        }
        return true;
    }

    isEmptyHorizontal(target: Cell): boolean {
        if (this.y !== target.y) {
            return false;
        }

        const min = Math.min(this.x, target.x);
        const max = Math.max(this.x, target.x);
        for (let x = min+1; x < max; x++) {
            if (!this.board.getCell(x, this.y).isEmpty()) {
                return false;
            }
        }
        return true;
    }

    isEmptyDiagonal(target: Cell): boolean {
        const absX = Math.abs(target.x - this.x)
        const absY = Math.abs(target.y - this.y)

        if (absX !== absY)
            return false;

        const dy = this.y < target.y ? 1: -1
        const dx = this.x < target.x ? 1: -1

        for (let i = 1; i < absY; i++) {
            if (!this.board.getCell(this.x + dx*i, this.y + dy*i).isEmpty())
                return false;
        }
        return true;
    }

    setFigure(figure: Figure) {
        this.figure = figure;
        this.figure.cell = this;
    }

    addLostFigure(figure: Figure) {
        figure.color === Colors.BLACK
            ? this.board.lostBlackFigures.push(figure)
            : this.board.lostWhiteFigures.push(figure)
    }

    moveFigure(target: Cell) {
        if (this.figure?.canMove(target)) {
            this.figure?.moveFigure(target)
            if (target.figure) {
                this.addLostFigure(target.figure);
            }
            target.setFigure(this.figure)
            this.figure = null
        }
    }
}
