package game

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"github.com/notnil/chess"

	"github.com/gorilla/websocket"
)

type stateMessage struct {
	Board string
	Moves []string
}

func newStateMessage(game *chess.Game) stateMessage {
	moves := []string{}

	for _, m := range game.ValidMoves() {
		moves = append(moves, m.String())
	}

	msg := stateMessage{
		Board: game.FEN(),
		Moves: moves,
	}

	return msg
}

// The Game interface
type Game interface {
	Mode() string
	Join(*websocket.Conn)
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

	if !oneDevice {
		white.WriteMessage(websocket.TextMessage, []byte("role white"))
	}

	go func() {
		for {
			_, message, err := white.ReadMessage()
			if err != nil {
				log.Println("read", white.RemoteAddr(), err)
				game.transmitString("error white player left")
				return
			}
			log.Printf("game recv: %s", message)

			game.handleSocketMessage(true, string(message))
		}
	}()

	if oneDevice {
		game.transmitMoves()
	}

	return game
}

func (g *ChessGame) Mode() string {
	return g.mode
}

func (g *ChessGame) transmitMoves() {
	if g.mode == "krieg" {
		fmt.Println("stripping enemy pieces")
		fen := g.game.FEN()

		w := ""
		b := ""

		for _, c := range strings.Split(fen, " ")[0] {
			if c >= 'a' && c <= 'z' {
				w += "1"
				b += string(c)
			} else if c >= 'A' && c <= 'Z' {
				w += string(c)
				b += "1"
			} else {
				w += string(c)
				b += string(c)
			}
		}

		info := strings.Join(strings.Split(fen, " ")[1:], " ")

		w += " " + info
		b += " " + info

		wNew, err := chess.FEN(w)
		if err != nil {
			fmt.Println("error:", err)
		}
		bNew, _ := chess.FEN(b)

		w = chess.NewGame(wNew).FEN()
		b = chess.NewGame(bNew).FEN()

		msg := newStateMessage(g.game)

		bmsg, _ := json.Marshal(msg)
		for _, spectator := range g.spectators {
			spectator.WriteMessage(websocket.TextMessage, bmsg)
		}

		msg.Board = w

		bmsg, _ = json.Marshal(msg)
		g.white.WriteMessage(websocket.TextMessage, bmsg)

		msg.Board = b

		bmsg, _ = json.Marshal(msg)
		g.black.WriteMessage(websocket.TextMessage, bmsg)

	} else {
		msg := newStateMessage(g.game)

		b, _ := json.Marshal(msg)

		g.white.WriteMessage(websocket.TextMessage, b)

		if g.black != nil {
			g.black.WriteMessage(websocket.TextMessage, b)
		}

		for _, spectator := range g.spectators {
			spectator.WriteMessage(websocket.TextMessage, b)
		}
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

		c.WriteMessage(websocket.TextMessage, []byte("role black"))

		g.transmitMoves()

		go func() {
			for {
				_, message, err := c.ReadMessage()
				if err != nil {
					log.Println("read", c.RemoteAddr(), err)
					g.transmitString("error black player left")
					return
				}
				log.Printf("game recv: %s", message)

				g.handleSocketMessage(false, string(message))
			}
		}()

	} else {
		g.spectators = append(g.spectators, c)
		c.WriteMessage(websocket.TextMessage, []byte("role spectator"))
		msg := newStateMessage(g.game)

		b, _ := json.Marshal(msg)

		c.WriteMessage(websocket.TextMessage, b)
	}
}

func (g *ChessGame) handleSocketMessage(white bool, msg string) {
	fmt.Println("handling message")
	fmt.Println("white message:", white)

	if len(msg) > 5 && msg[0:4] == "move" {
		log.Println("user wants to make move", msg[5:])

		fmt.Println("white move:", white)
		fmt.Println("white turn:", g.game.Position().Turn() == chess.White)

		if g.oneDevice || (g.game.Position().Turn() == chess.White && white) || (g.game.Position().Turn() == chess.Black && !white) {
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
