package main

import (
	"fmt"
	"log"

	"github.com/ethereum/go-ethereum/rpc"
)

func main() {
	// Подключаемся к узлу Sepolia через Infura
	client, err := rpc.Dial("https://sepolia.infura.io/v3/c445d0d9b8ef44879b1b5636c4ec631c")
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()

	// Получаем номер последнего блока
	var latestBlockNumber string
	err = client.Call(&latestBlockNumber, "eth_blockNumber")
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Последний блок в Sepolia:", latestBlockNumber)
}
