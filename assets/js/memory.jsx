import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';

export default function run_memory(root) {
	ReactDOM.render(<Memory />, root);
}

//

class Memory extends React.Component {
	constructor(props) {
		super(props);

		let cards = [];
		
    for(let i = 0; i < 16; i++) {
			let card = { flipped: false, matched: false };
			cards[i] = card;
		}

		let cardLet = this.randomLetter(cards);
    
		this.state = {
			cards: cardLet,
			clicks: 0,
		};
	}

  //getter for state.cards
  getCards() {
    return this.state.cards;
  }

  //getter for state.clicks
  getClicks() {
    return this.state.clicks;
  }

	//generates the random capital letters A-H for each card, with each letter
  // appearing twice
	randomLetter(cards) {
		let contents = "ABCDEFGHABCDEFGH";
		let clet = _.map(cards, (card) => {
				let letr = contents.charAt(Math.floor(Math.random() * contents.length));
				contents = contents.replace(letr, "");
				return _.extend(card, {letter: letr});
		});
		return clet;
	}

  //reloads the page to reset the game
  resetGame(e) {
    e.stopPropagation();
    return location.reload();
  }

	//flips a down card over
	clickCard(index) {
		let flipped = [];
		for ( let i = 0; i < 16; i++) {
			if (this.state.cards[i].flipped) {
				flipped.push(i);
			}
		}

    if (flipped.length < 2) {
      let flipCards = _.map(this.state.cards, (card, i) => {
			  if (i == index) {
				  return _.extend(card, {flipped: true});
			  }
			  return card;
		  });

      let addClick = this.state.clicks + 1;
		  this.setState({cards: flipCards, clicks: addClick});
    }
	}

	//determines if the flipped cards match and changes them if so
	tryMatch() {
		let flipped = [];
		for ( let i = 0; i < 16; i++) {
			if (this.state.cards[i].flipped) {
				flipped.push(i);
			}
		}

		if (flipped.length == 2) {
			let newCards = _.map(this.state.cards, (card, i) => {
				if (flipped.includes(i)) {
					if (this.state.cards[flipped[0]].letter == this.state.cards[flipped[1]].letter) {
						return _.extend(card, {flipped: false, matched: true});
					}
					return _.extend(card, {flipped: false});
				}
				else {
					return card;
				}
			});

			this.setState({cards: newCards});
		}
	}
	
	render() {
		let cards_list = _.map(this.state.cards, (card, ii) => {
			return <CardRender idx={ii} card={card} tryMatch={this.tryMatch.bind(this)} clickCard={this.clickCard.bind(this)} root={this} key={ii} />;
		});
    let clicks = this.getClicks();
		return (
			<span>
				<div className="row">
					{cards_list}
				</div>
				<div className="row">
					<div className="col-5">
						<p>Clicks: {clicks}</p>
					</div>
					<div className="col-2">
						<Button onClick={this.resetGame.bind(this)}>Reset</Button>
					</div>
				</div>
				<div className="row">
          <div className="col">
					  <p><GetScore getClicks={this.getClicks.bind(this)} /></p>
					  <IsGameOver root={this} getClicks={this.getClicks.bind(this)} />
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
		window.setTimeout(props.tryMatch, 1000);
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

//calculates the current score based on the number of clicks
function GetScore(props) {
	if (props.getClicks() <= 16) {
		return <span>Score: 100</span>;
	}
	else {
		let score = 100 - ((props.getClicks() - 16) * 2);	
		return <span>Score: {score}</span> 
	}
}

//determines if the game is over
function IsGameOver(props) {
  let cards = props.root.getCards();
	for ( let i = 0; i < 16; i++) {
		if (!cards[i].matched) {
			return <div></div>;
		}
	}
	return (<div className="alert alert-success" role="alert">
			You won with {GetScore(props)}!
			</div>);
}
