import React, { Component } from 'react'

import fenHandler from './utils/fen';

import imgKw from './images/imgKw.svg'
import imgQw from './images/imgQw.svg'
import imgRw from './images/imgRw.svg'
import imgBw from './images/imgBw.svg'
import imgNw from './images/imgNw.svg'
import imgPw from './images/imgPw.svg'

import imgKb from './images/imgKb.svg'
import imgQb from './images/imgQb.svg'
import imgRb from './images/imgRb.svg'
import imgBb from './images/imgBb.svg'
import imgNb from './images/imgNb.svg'
import imgPb from './images/imgPb.svg'

const images = new Map([
    ['K', imgKw],
    ['Q', imgQw],
    ['R', imgRw],
    ['B', imgBw],
    ['N', imgNw],
    ['P', imgPw],
    ['k', imgKb],
    ['q', imgQb],
    ['r', imgRb],
    ['b', imgBb],
    ['n', imgNb],
    ['p', imgPb],
])

interface ISquareProps {
    black: boolean;
    piece: string;
    highlight: string;
    onClick: () => void;
    key: number;
}

class Square extends React.Component<ISquareProps> {
    render() {
        var content;

        if (images.get(this.props.piece) !== undefined) {
            content = <img className="piece" src={images.get(this.props.piece)} alt={this.props.piece} />
        }

        return (
            <div className={"Square " + (this.props.black ? "black" : "white") + (this.props.highlight ? " highlight" : "")} onClick={this.props.highlight ? this.props.onClick : () => { }}>
                {content}
            </div>
        )
    }
}

interface IRowProps {
    fen: string;
    n: number;
    highlight: string[][];
    onClick: (move: string) => void;
    key: number;
}

class Row extends Component<IRowProps> {
    render() {
        return (
            <div className="Row">
                {this.props.fen.split('').map(
                    (symbol: string, n: number): JSX.Element =>
                        React.createElement(Square,
                            {
                                black: (this.props.n % 2 === 0 && n % 2 !== 0) || (this.props.n % 2 !== 0 && n % 2 === 0),
                                piece: symbol,
                                highlight: this.props.highlight[this.props.n][n],
                                onClick: () => { this.props.onClick(this.props.highlight[this.props.n][n]) },
                                key: n,
                            }
                        )
                )}
            </div>
        );
    }
}

interface IPromotionRowProps {
    enabled: boolean;
    isWhiteMove: boolean;
    onClick: (piece: string) => void;
}

class PromotionRow extends Component<IPromotionRowProps> {
    render() {
        if (this.props.enabled) {
            return (
                <div className="Row Promotion">
                    {['q', 'n', 'r', 'b'].map((symbol: string) => React.createElement(Square,
                        {
                            black: false,
                            piece: this.props.isWhiteMove ? symbol.toUpperCase() : symbol,
                            highlight: "yayy",
                            onClick: () => this.props.onClick(symbol),
                            key: symbol.charCodeAt(0),
                        }
                    )
                    )}
                </div>
            )
        } else {
            return (<div className="Row Promotion"></div>)
        }
    }
}

interface IChessBoardProps {
    fen: string;
    moves: string[];
    makeMove: (move: string) => void;
    role: string;
}

interface IChessBoardState {
    phase: string;
    piece: string;
    newFen: string;
    move: string;
    color: "white" | "black";
}

export default class ChessBoard extends Component<IChessBoardProps, IChessBoardState> {
    constructor(props: IChessBoardProps) {
        super(props);

        this.state = {
            phase: "select",
            piece: "",
            move: "",
            newFen: "",
            color: "white",
        };
    }
    h = new fenHandler();

    handleClick(move: string) {
        if (this.state.phase === "select") {
            console.log("user clicked on piece", move.substring(0, 2));
            this.setState({ phase: "move", piece: move.substring(0, 2) });
        } else if (this.state.phase === "move") {
            console.log("user selected move", move);
            if (move === "reset") {
                this.setState({ phase: "select" });
            } else if (move.length === 4) {
                var pos = this.h.decodePosition(this.state.piece);
                this.setState({
                    phase: "done",
                    newFen: this.h.move(
                        this.props.fen,
                        this.h.getFenParts(this.props.fen)[pos[1]][pos[0]],
                        this.state.piece,
                        move.substring(2, 4),
                    )
                });
                this.props.makeMove(move);
            } else {
                console.log("this is a promotion move")
                var pos = this.h.decodePosition(this.state.piece);
                this.setState({
                    phase: "promote",
                    newFen: this.h.move(
                        this.props.fen,
                        this.h.getFenParts(this.props.fen)[pos[1]][pos[0]],
                        this.state.piece,
                        move.substring(2, 4),
                    ),
                    move: move.substring(0, 4),
                });
            }
        }

    }

    handlePromotion(piece: string) {
        console.log("user wants to promote to", piece);
        var pos = this.h.decodePosition(this.state.piece);
        this.setState({
            phase: "done",
            newFen: this.h.move(
                this.props.fen,
                this.isWhiteMove ? piece.toUpperCase() : piece,
                undefined,
                this.state.move.substring(2, 4),
            )
        });
        this.props.makeMove(this.state.move+piece);
    }

    isWhiteMove(): boolean {
        var parts = this.props.fen.split(' ');
        if (parts.length > 1) {
            return parts[1] === "w"
        } else {
            return true
        }
    }

    renderFen(fen: string, highlight: string[][]) {
        return (
            <div className="ChessBoard">
                <PromotionRow enabled={this.state.phase === "promote"} onClick={(piece: string) => this.handlePromotion(piece)} isWhiteMove={this.isWhiteMove()} />
                {this.h.getFenParts(fen).map(
                    (row: string, n: number): JSX.Element =>
                        React.createElement(Row,
                            {
                                fen: row,
                                n: n,
                                highlight: highlight,
                                onClick: (move: string) => this.handleClick(move),
                                key: n,
                            }
                        )
                )}
            </div>
        )
    }

    componentWillReceiveProps() {
        this.setState({ phase: "select" });
    }

    render() {
        console.log("board state:", this.state);

        var highlight = [["", "", "", "", "", "", "", "",], ["", "", "", "", "", "", "", "",], ["", "", "", "", "", "", "", "",], ["", "", "", "", "", "", "", "",], ["", "", "", "", "", "", "", "",], ["", "", "", "", "", "", "", "",], ["", "", "", "", "", "", "", "",], ["", "", "", "", "", "", "", "",],]

        if (this.props.role === "" || (this.props.role === "white" && this.isWhiteMove()) || (this.props.role === "black" && !this.isWhiteMove)) {
            if (this.state.phase === "done" || this.state.phase === "promote") {
                return this.renderFen(this.state.newFen, highlight);
            }
    
            if (this.state.phase === "select") {
                this.props.moves.forEach((v: string) => {
                    var pos = this.h.decodePosition(v);
                    highlight[pos[1]][pos[0]] = v;
                })
            } else if (this.state.phase === "move") {
                this.props.moves.forEach((v: string) => {
                    if (v.substring(0, 2) === this.state.piece) {
                        var pos = this.h.decodePosition(v.substring(2, 4));
                        highlight[pos[1]][pos[0]] = v;
                    }
                })
                var pos = this.h.decodePosition(this.state.piece);
                highlight[pos[1]][pos[0]] = "reset";
            }
        }

        return this.renderFen(this.props.fen, highlight)
    }
}
