import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';

export default function run_memory(root, channel, game) {
	ReactDOM.render(<Memory channel={channel} game={game} />, root);
}

class Memory extends React.Component {
	constructor(props) {
        super(props);

        this.channel = props.channel;

        this.state = props.game;

        this.newView = this.newView.bind(this);
	}

    //taken from Nat Tuck's lecture notes
    newView(view) {
        console.log("New view", view);
        this.setState(view);

        let flipped = this.flipped(view.cards);
        if (flipped.length == 2) {
            window.setTimeout(() => this.flipBack(), 1000);
        }
    }

    //sends the index of the card that was clicked to the server
    clickCard(index) {
		let flipped = this.flipped(this.state.cards);

        if (flipped.length < 2) {
            this.channel.push("click", { state: this.state, card: index })
                .receive("ok", this.newView);
        }
    }

    //tells the server to reset the cards to a new game state
    resetGame() {
        this.channel.push("reset", {})
            .receive("ok", this.newView);
    }

    //tells the server to flip all cards back over
    flipBack() {
        this.channel.push("flip-back", { state: this.state })
            .receive("ok", this.newView);
    }

    //Returns a list of the cards that are flipped
    flipped(cards) {
		let flipped = [];
		for ( let i = 0; i < 16; i++) {
			if (cards[i].flipped) {
				flipped.push(i);
			}
        }
        return flipped;
    }

	render() {
		let cards_list = _.map(this.state.cards, (card, ii) => {
            return <CardRender idx={ii} card={card} clickCard={this.clickCard.bind(this)} key={ii} />;
        });
		return (
			<span>
				<div className="row">
					{cards_list}
				</div>
				<div className="row">
					<div className="col-5">
						<p>Clicks: {this.state.clicks}</p>
					</div>
					<div className="col-2">
						<Button onClick={this.resetGame.bind(this)}>Reset</Button>
					</div>
				</div>
				<div className="row">
                    <div className="col">
                        <p>Score: {this.state.score}</p>
					    <IsGameOver cards={this.state.cards} score={this.state.score} />
                    </div>
				</div>
			</span>
		);
	}
}

//show the cards on the screen
function CardRender(props) {
	let card = props.card;
	if(card.matched) {
		return (<div className="col-3">
			<div className="card" style={{width: 82, height: 112}}>
				<img className="card-img" src="/images/matched.png" style={{width: 80, height: "auto"}} alt="Matched card"/>
			</div>
		</div>);
	}
	else if(card.flipped) {
        //window.setTimeout(props.tryMatch, 1000);
		return (<div className="col-3">
			<div className="card text-center" style={{width: 82, height: 112}}>
				<div className="card-body">
					<p className="card-text">{card.letter}</p>
				</div>
			</div>
		</div>);
	}
	else {
		return (<div className="col-3">
            <div className="card" style={{width: 82}}>
				<img className="card-img" src="images/cardBack.jpg" style={{width: 80, height: "auto"}} alt="Card Back" onClick={() => props.clickCard(props.idx)}  />
			</div>
		</div>);
	}
}

//determines if the game is over
function IsGameOver(props) {
    for ( let i = 0; i < 16; i++) {
	    if (!props.cards[i].matched) {
	    	return <div></div>;
	    }
	}
	return (<div className="alert alert-success" role="alert">
	    	You won with {props.score}!
        </div>);
}
