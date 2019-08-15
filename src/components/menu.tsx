import React, { Component, ChangeEvent } from 'react'
import { Container, Hero, Heading, Tile, Section, Footer, Content, Button } from 'react-bulma-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChess, faChessRook, faChessKnight, faChessBishop, faChessQueen, faChessPawn } from '@fortawesome/free-solid-svg-icons'


export default class GameMenu extends Component {
    render() {
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
                                            <Tile renderAs="article" kind="child" notification color="info" className="Link" onClick={() => this.startChess1Device()}>
                                                <Heading subtitle>Mit einem Gerät</Heading>
                                            </Tile>
                                        </Tile>
                                        <Tile kind="parent">
                                            <Tile renderAs="article" kind="child" notification color="info" className="Link" onClick={() => this.enterLobby("chess")}>
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
                                            <Tile renderAs="article" kind="child" notification color="info" className="Link" onClick={() => this.enterLobby("krieg")}>
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
                                                    <Tile renderAs="article" kind="child" notification color="primary" className="Link">
                                                        <Heading subtitle><FontAwesomeIcon icon={faChessRook} /></Heading>
                                                    </Tile>
                                                </Tile>
                                                <Tile kind="parent">
                                                    <Tile renderAs="article" kind="child" notification color="primary" className="Link">
                                                        <Heading subtitle><FontAwesomeIcon icon={faChessKnight} /></Heading>
                                                    </Tile>
                                                </Tile>
                                                <Tile kind="parent">
                                                    <Tile renderAs="article" kind="child" notification color="primary" className="Link">
                                                        <Heading subtitle><FontAwesomeIcon icon={faChessBishop} /></Heading>
                                                    </Tile>
                                                </Tile>
                                                <Tile kind="parent">
                                                    <Tile renderAs="article" kind="child" notification color="primary" className="Link">
                                                        <Heading subtitle><FontAwesomeIcon icon={faChessQueen} /></Heading>
                                                    </Tile>
                                                </Tile>
                                                <Tile kind="parent">
                                                    <Tile renderAs="article" kind="child" notification color="primary" className="Link">
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
                                                    <Tile renderAs="article" kind="child" notification color="primary" className="Link">
                                                        <Heading subtitle><FontAwesomeIcon icon={faChessRook} /></Heading>
                                                    </Tile>
                                                </Tile>
                                                <Tile kind="parent">
                                                    <Tile renderAs="article" kind="child" notification color="primary" className="Link">
                                                        <Heading subtitle><FontAwesomeIcon icon={faChessKnight} /></Heading>
                                                    </Tile>
                                                </Tile>
                                                <Tile kind="parent">
                                                    <Tile renderAs="article" kind="child" notification color="primary" className="Link">
                                                        <Heading subtitle><FontAwesomeIcon icon={faChessBishop} /></Heading>
                                                    </Tile>
                                                </Tile>
                                                <Tile kind="parent">
                                                    <Tile renderAs="article" kind="child" notification color="primary" className="Link">
                                                        <Heading subtitle><FontAwesomeIcon icon={faChessQueen} /></Heading>
                                                    </Tile>
                                                </Tile>
                                                <Tile kind="parent">
                                                    <Tile renderAs="article" kind="child" notification color="primary" className="Link">
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
