import React, { Component, ChangeEvent } from 'react'

import { Container, Hero, Heading, Tile, Section, Footer, Content, Button } from 'react-bulma-components';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChess, faChessRook, faChessKnight, faChessBishop, faChessQueen, faChessPawn } from '@fortawesome/free-solid-svg-icons'

import Board from './board';

export default class Game extends Component {
    state = {
        connected: false,
        started: false,
        fen: "8/8/8/8/8/8/8/8",
        moves: [],
        ConnectionMessage: "getrennt",
        lobby: false,
        gameMode: "",
        gameId: "",
        enteredId: "",
        outcome: "no",
        role: "",
    }

    //ws = new WebSocket('wss://chess.mwalli.ch/socket');

    ws = new WebSocket('ws://localhost:8000/socket');

    public componentDidMount() {
        this.ws.onmessage = (evt: MessageEvent) => {
            console.log("received message:", evt.data);
            this.onMessage(evt.data);
        };

        this.ws.addEventListener('open', function (event) {
            this.send('helo');
        });

        this.ws.onclose = () => {
            console.error("Connection closed :/");
            if (this.state.connected) {
                this.setState({ ConnectionMessage: "getrennt" });
            }
        }

        if (window.location.href.split("#").length === 2) {

            var interval = window.setInterval((handler: TimerHandler) => {
                if (this.state.connected) {
                    this.setState({ enteredId: window.location.href.split('#')[1].substring(1) });
                    this.joinGame();
                    window.clearInterval(interval);
                }
            }, 100)
        }
    }

    onMessage(rawmsg: string) {
        if (rawmsg === 'helo') {
            this.setState({ connected: true, ConnectionMessage: "verbunden" });
            return;
        }

        if (rawmsg.length > 3 && rawmsg.substring(0, 2) === "id") {
            this.setState({ gameId: rawmsg.substring(3) });
            return;
        }

        if (rawmsg.length > 9 && rawmsg.substring(0, 9) === "game over") {
            this.setState({ outcome: rawmsg.substring(10) });
            return;
        }

        if (rawmsg.length > 5 && rawmsg.substring(0, 5) === "error") {
            alert(rawmsg);
            return;
        }

        if (rawmsg.length > 4 && rawmsg.substring(0, 4) === "role") {
            console.log("new role:", rawmsg.substring(5))
            this.setState({ role: rawmsg.substring(5) })
            return;
        }

        var msg = JSON.parse(rawmsg);

        if (msg.Board !== undefined && msg.Moves !== undefined) {
            console.log("got new position:", msg);
            this.setState({ fen: msg.Board, moves: msg.Moves });
            console.log("updated state:", this.state);
        }
    }

    startGame(mode: string) {
        this.ws.send("start " + mode);
        this.setState({ lobby: true, gameMode: mode, gameId: "not received", started: true })
    }

    joinGame() {
        this.ws.send("join " + this.state.enteredId)
        this.setState({ started: true })
    }

    render() {
        if (this.state.started) {
            var lobby;

            if (this.state.lobby) {
                lobby = <p>Spiel ID: {this.state.gameId}</p>
            }

            var results;

            if (this.state.outcome !== "no") {
                results = <Section>
                    <Container>
                        <Heading style={{ textAlign: 'center' }}>
                            {this.state.outcome === "draw" ? "Unentschieden" :
                                (this.state.outcome === "white" ? "Weiß" : "Schwarz") + " hat gewonnen."}
                        </Heading>
                    </Container>
                </Section>
            }

            return (
                <div>
                    <div className="Infos">
                        {lobby}
                        {results}
                    </div>
                    <div className="Game">
                        <Board fen={this.state.fen} moves={this.state.moves} makeMove={(move: string) => this.ws.send("move " + move)} role={this.state.role} />
                    </div>
                </div>
            )
        }

        return (
            <div className="Menu">
                <Hero color="dark" >
                    <Hero.Body>
                        <Section>
                            <Container>
                                <Heading><FontAwesomeIcon icon={faChess} className="headerIcon" /> Schach</Heading>
                                <div>
                                    <input type="text" placeholder="Spiel-ID eingeben" onChange={(evt: ChangeEvent<HTMLInputElement>) => { this.setState({ enteredId: evt.target.value }) }} />
                                    <Button onClick={() => this.joinGame()} id="joinButton">Beitreten</Button>
                                </div>
                            </Container>
                        </Section>
                    </Hero.Body>
                </Hero>
                <Section>
                    <Container>
                        <Tile kind="ancestor">
                            <Tile kind="parent" vertical>
                                <Tile renderAs="article" kind="child" notification color="light">
                                    <Heading>Standard</Heading>
                                    <Heading subtitle>Nach Standard Regeln</Heading>
                                    <Tile kind="ancestor">
                                        <Tile kind="parent">
                                            <Tile renderAs="article" kind="child" notification color="info" className="Link" onClick={() => this.startGame("chess single")}>
                                                <Heading subtitle>Mit einem Gerät</Heading>
                                            </Tile>
                                        </Tile>
                                        <Tile kind="parent">
                                            <Tile renderAs="article" kind="child" notification color="info" className="Link" onClick={() => this.startGame("chess multi")}>
                                                <Heading subtitle>Mit mehreren Geräten</Heading>
                                            </Tile>
                                        </Tile>
                                    </Tile>
                                </Tile>
                                <Tile renderAs="article" kind="child" notification color="light">
                                    <Heading>Kriegspiel</Heading>
                                    <Heading subtitle>Figuren des Gegners sind nicht sichtbar</Heading>
                                    <Tile kind="ancestor">
                                        <Tile kind="parent">
                                            <Tile renderAs="article" kind="child" notification color="info" className="Link" onClick={() => this.startGame("krieg")}>
                                                <Heading subtitle>Mit mehreren Geräten</Heading>
                                            </Tile>
                                        </Tile>
                                    </Tile>
                                </Tile>
                            </Tile>
                            <Tile kind="parent">
                                <Tile renderAs="article" kind="child" notification color="light">
                                    <Heading>Einzelne Figuren</Heading>
                                    <Tile kind="parent" vertical>
                                        <Tile renderAs="article" kind="child" notification color="warning">
                                            <Heading subtitle>Mit einem Gerät</Heading>
                                            <Tile kind="ancestor">
                                                <Tile kind="parent">
                                                    <Tile renderAs="article" kind="child" notification color="primary" className="Link" onClick={() => this.startGame("chessr single")}>
                                                        <Heading subtitle><FontAwesomeIcon icon={faChessRook} /></Heading>
                                                    </Tile>
                                                </Tile>
                                                <Tile kind="parent">
                                                    <Tile renderAs="article" kind="child" notification color="primary" className="Link" onClick={() => this.startGame("chessk single")}>
                                                        <Heading subtitle><FontAwesomeIcon icon={faChessKnight} /></Heading>
                                                    </Tile>
                                                </Tile>
                                                <Tile kind="parent">
                                                    <Tile renderAs="article" kind="child" notification color="primary" className="Link" onClick={() => this.startGame("chessb single")}>
                                                        <Heading subtitle><FontAwesomeIcon icon={faChessBishop} /></Heading>
                                                    </Tile>
                                                </Tile>
                                                <Tile kind="parent">
                                                    <Tile renderAs="article" kind="child" notification color="primary" className="Link" onClick={() => this.startGame("chessq single")}>
                                                        <Heading subtitle><FontAwesomeIcon icon={faChessQueen} /></Heading>
                                                    </Tile>
                                                </Tile>
                                                <Tile kind="parent">
                                                    <Tile renderAs="article" kind="child" notification color="primary" className="Link" onClick={() => this.startGame("chessp single")}>
                                                        <Heading subtitle><FontAwesomeIcon icon={faChessPawn} /></Heading>
                                                    </Tile>
                                                </Tile>
                                            </Tile>
                                        </Tile>
                                    </Tile>
                                    <Tile kind="parent">
                                        <Tile renderAs="article" kind="child" notification color="warning">
                                            <Heading subtitle>Mit mehreren Geräten</Heading>
                                            <Tile kind="ancestor">
                                                <Tile kind="parent">
                                                    <Tile renderAs="article" kind="child" notification color="primary" className="Link" onClick={() => this.startGame("chessr multi")}>
                                                        <Heading subtitle><FontAwesomeIcon icon={faChessRook} /></Heading>
                                                    </Tile>
                                                </Tile>
                                                <Tile kind="parent">
                                                    <Tile renderAs="article" kind="child" notification color="primary" className="Link" onClick={() => this.startGame("chessk multi")}>
                                                        <Heading subtitle><FontAwesomeIcon icon={faChessKnight} /></Heading>
                                                    </Tile>
                                                </Tile>
                                                <Tile kind="parent">
                                                    <Tile renderAs="article" kind="child" notification color="primary" className="Link" onClick={() => this.startGame("chessb multi")}>
                                                        <Heading subtitle><FontAwesomeIcon icon={faChessBishop} /></Heading>
                                                    </Tile>
                                                </Tile>
                                                <Tile kind="parent">
                                                    <Tile renderAs="article" kind="child" notification color="primary" className="Link" onClick={() => this.startGame("chessq multi")}>
                                                        <Heading subtitle><FontAwesomeIcon icon={faChessQueen} /></Heading>
                                                    </Tile>
                                                </Tile>
                                                <Tile kind="parent">
                                                    <Tile renderAs="article" kind="child" notification color="primary" className="Link" onClick={() => this.startGame("chessp multi")}>
                                                        <Heading subtitle><FontAwesomeIcon icon={faChessPawn} /></Heading>
                                                    </Tile>
                                                </Tile>
                                            </Tile>
                                        </Tile>
                                    </Tile>
                                </Tile>
                            </Tile>
                        </Tile>
                    </Container>
                </Section>
                <Hero>
                    <Hero.Footer>
                        <Footer>
                            <Container>
                                <Content style={{ textAlign: 'center' }}>
                                    <p>Server Status: {this.state.ConnectionMessage}</p>
                                </Content>
                            </Container>
                        </Footer>
                    </Hero.Footer>
                </Hero>
            </div>
        )
    }
}
