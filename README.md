#Readme

##Overview

This is a nodejs script to read for events from the CorCom contract using the Etherscan API. This allows watching the contract without the need to run an expensive full node. It can be used as a model to watch other CorCom contracts.

There are several limitations to this method. This is read only, the node can only be queried five times a second, and certain functionality from web3 such as event handling is not possible. Any one extensively using the blockchain should invest in their own full node (or work with other CorComs to do so).

##Setup

Make sure nodejs is installed. Go to https://etherscan.io/apis and create a token. This will be used when making requests. Copy the token and paste it inside the quotation marks for the TOKEN variable (on line 4 as of writing). Set latest block (line 10) to the earliest block you want to query. It defaults to 0, which is the entire blockchain. Note that etherscan will not return more than 1000 events. This program will not scan blocks which it has already scanned. This parameter only effects where the program will begin looking. Finally, set the delay on the last line of the program. Default is 5000ms. Do not put it below 200ms, because that will get you blocked for exceeding etherscan's maximum requests of 5 a second.

To run, run server.js with nodejs. It will print all events from the latest block, and will print new events as they are detected. Currently, only creation and transfer events are tracked.

##Other development goals

###Short-term

Saving data to file
Serving events/data as a server
Query multiple times if 1000 events limit is surpassed
Use GETH proxy to not rescan recent blocks without events.

###Long-term

Using Etherscan web sockets
Allowing use of filters to find specific events and/or watch certain addresses
Command line options to prevent the need for editing the script
