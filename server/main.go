package main

import (
	"flag"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"time"

	"git.laze.today/ouzu/kriegspiel/server/game"
	"github.com/gorilla/websocket"
)

var addr = flag.String("addr", "localhost:8000", "http service address")

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
} // use default options

var games = make(map[string]game.Game)

func echo(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}

	for {
		mt, message, err := c.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}
		log.Printf("lobby recv: %s", message)

		msg := string(message)

		if msg == "helo" {
			err = c.WriteMessage(mt, message)
			if err != nil {
				log.Println("write:", err)
				break
			}
		}

		if len(msg) > 4 && msg[0:4] == "join" {
			if g, ok := games[msg[5:]]; ok {
				g.Join(c)
				return
			} else {
				c.WriteMessage(websocket.TextMessage, []byte("error game doesn't exist"))
			}
		}

		if msg == "start chess single" {
			id := fmt.Sprintf("%d", rand.Intn(9000)+1000)
			games[id] = game.NewChessGame(c, "chess", true)
			c.WriteMessage(mt, []byte("id "+id))
			return
		} else if msg == "start chess multi" {
			id := fmt.Sprintf("%d", rand.Intn(9000)+1000)
			games[id] = game.NewChessGame(c, "chess", false)
			err = c.WriteMessage(mt, []byte("id "+id))
			return
		} else if msg == "start krieg" {
			id := fmt.Sprintf("%d", rand.Intn(9000)+1000)
			games[id] = game.NewChessGame(c, "krieg", false)
			err = c.WriteMessage(mt, []byte("id "+id))
			return
		}
	}
}

func main() {
	flag.Parse()
	log.SetFlags(0)

	rand.Seed(time.Now().Unix())

	http.HandleFunc("/socket", echo)
	http.Handle("/", http.FileServer(http.Dir("../build/")))
	log.Fatal(http.ListenAndServe(*addr, nil))
}
