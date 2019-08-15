package game

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/notnil/chess"

	"github.com/gorilla/websocket"
)

type stateMessage struct {
	Board string
	Moves []string
}

func newStateMessage(game *chess.Game) []byte {
	moves := []string{}

	for _, m := range game.ValidMoves() {
		moves = append(moves, m.String())
	}

	msg := stateMessage{
		Board: game.FEN(),
		Moves: moves,
	}

	b, _ := json.Marshal(msg)

	return b
}

// The Game interface
type Game interface {
	Name() string
	Id() string
	Join(*websocket.Conn) error
}

// ChessGame is a one-device game of chess
type ChessGame struct {
	white      *websocket.Conn
	black      *websocket.Conn
	spectators []*websocket.Conn
	game       *chess.Game
	mode       string
	oneDevice  bool
}

// NewChessGame creates a new chess game
func NewChessGame(white *websocket.Conn, mode string, oneDevice bool) *ChessGame {
	game := &ChessGame{
		white:     white,
		game:      chess.NewGame(),
		mode:      mode,
		oneDevice: oneDevice,
	}

	go func() {
		for {
			_, message, err := white.ReadMessage()
			if err != nil {
				log.Println("read", white.RemoteAddr(), err)
				return
			}
			log.Printf("recv: %s", message)

			game.handleSocketMessage(true, string(message))
		}
	}()

	return game
}

func (g *ChessGame) transmitMoves() {
	msg := newStateMessage(g.game)

	g.white.WriteMessage(websocket.TextMessage, msg)

	if g.black != nil {
		g.black.WriteMessage(websocket.TextMessage, msg)
	}

	for _, spectator := range g.spectators {
		spectator.WriteMessage(websocket.TextMessage, msg)
	}
}

func (g *ChessGame) transmitString(message string) {
	msg := []byte(message)

	g.white.WriteMessage(websocket.TextMessage, msg)

	if g.black != nil {
		g.black.WriteMessage(websocket.TextMessage, msg)
	}

	for _, spectator := range g.spectators {
		spectator.WriteMessage(websocket.TextMessage, msg)
	}
}

func (g *ChessGame) Join(c *websocket.Conn) {
	if !g.oneDevice && g.black == nil {
		g.black = c
		g.transmitMoves()

		go func() {
			for {
				_, message, err := c.ReadMessage()
				if err != nil {
					log.Println("read", c.RemoteAddr(), err)
					return
				}
				log.Printf("recv: %s", message)

				g.handleSocketMessage(false, string(message))
			}
		}()

	} else {
		g.spectators = append(g.spectators, c)
		c.WriteMessage(websocket.TextMessage, []byte("spectator"))
		c.WriteMessage(websocket.TextMessage, newStateMessage(g.game))
	}
}

func (g *ChessGame) handleSocketMessage(white bool, msg string) {
	if len(msg) > 5 && msg[0:4] == "move" {
		log.Println("user wants to make move", msg[5:])

		if g.oneDevice || (g.game.Position().Turn() == chess.White) == white {
			for _, m := range g.game.ValidMoves() {
				if m.String() == msg[5:] {
					g.game.Move(m)
					fmt.Println("made move")
					fmt.Println(g.game.Position().Board().Draw())
				}
			}
		} else {
			log.Println("illegal move")
		}

		g.transmitMoves()

		switch g.game.Outcome() {
		case chess.NoOutcome:
			break
		case chess.WhiteWon:
			g.transmitString("game over white")
		case chess.BlackWon:
			g.transmitString("game over black")
		case chess.Draw:
			g.transmitString("game over draw")
		}
	}
}
