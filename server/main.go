package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"math/rand"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/notnil/chess"
)

var addr = flag.String("addr", "localhost:8000", "http service address")

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
} // use default options

type moveMessage struct {
	Board string
	Moves []string
}

type Game struct {
	White *websocket.Conn
	Black chan *websocket.Conn
}

var games = make(map[string]Game)

func echo(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}

	defer c.Close()

	for {
		mt, message, err := c.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}
		log.Printf("recv: %s", message)

		msg := string(message)

		if msg == "helo" {
			err = c.WriteMessage(mt, message)
			if err != nil {
				log.Println("write:", err)
				break
			}
		}

		if len(msg) > 4 && msg[0:4] == "join" {
			joinSession(c, msg[6:])
		}

		if msg == "start chess single" {
			startSingleDeviceChess(c)
		} else if msg == "start chess multi" {
			startMultiDeviceChess(c)
		}
	}
}

func startMultiDeviceChess(c *websocket.Conn) {
	id := fmt.Sprintf("%d", rand.Intn(9000)+1000)
	c.WriteMessage(websocket.TextMessage, []byte("id "+id))

	wait := make(chan *websocket.Conn)

	games[id] = Game{White: c, Black: wait}

	black := <-wait
	white := c

	fmt.Println("Players met", black, white)
}

func joinSession(c *websocket.Conn, id string) {
	if _, ok := games[id]; ok {
		games[id].Black <- c
	}
}

func startSingleDeviceChess(c *websocket.Conn) {
	game := chess.NewGame()

	fmt.Println("new game created:")
	fmt.Println(game.Position().Board().Draw())

	transmitMoves := func() {
		moves := []string{}

		for _, m := range game.ValidMoves() {
			moves = append(moves, m.String())
		}

		msg := moveMessage{
			Board: game.FEN(),
			Moves: moves,
		}

		b, _ := json.Marshal(msg)

		c.WriteMessage(websocket.TextMessage, b)
	}

	transmitMoves()

	for {
		_, message, err := c.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}
		log.Printf("recv: %s", message)

		msg := string(message)

		if len(msg) > 5 && msg[0:4] == "move" {
			log.Println("user wants to make move", msg[5:])
			for _, m := range game.ValidMoves() {
				if m.String() == msg[5:] {
					game.Move(m)
					fmt.Println("made move")
					fmt.Println(game.Position().Board().Draw())
				}
			}
			transmitMoves()

			switch game.Outcome() {
			case chess.NoOutcome:
				break
			case chess.WhiteWon:
				c.WriteMessage(websocket.TextMessage, []byte("game over white"))
			case chess.BlackWon:
				c.WriteMessage(websocket.TextMessage, []byte("game over black"))
			case chess.Draw:
				c.WriteMessage(websocket.TextMessage, []byte("game over draw"))
			}
		}
	}
}

func main() {
	flag.Parse()
	log.SetFlags(0)
	http.HandleFunc("/socket", echo)
	http.Handle("/", http.FileServer(http.Dir("../build/")))
	log.Fatal(http.ListenAndServe(*addr, nil))
}
