defmodule Memory.Game do
  #Create new instance of a game
  def new do
    card_contents = String.split("ABCDEFGHABCDEFGH", "")
                    |> Enum.reject(fn(x) -> x == "" end)
    %{
      "cards"=> gen_cards(card_contents, 16, []),
      "clicks"=> 0,
    }
  end

  #Generate new cards
  defp gen_cards(contents, loops, list) when loops > 0 do
    letter = Enum.random(contents)
    contents = List.delete(contents, letter)
    list ++ make_card(letter, loops, contents)
  end

  #Return the list of new cards
  defp gen_cards(contents, loops, list) when loops == 0 do
    list ++ contents
  end

  #Make a single card
  defp make_card(letter, loops, contents) do
    card = [%{
      "letter"=> letter,
      "flipped"=> false,
      "matched"=> false,
    }]
    gen_cards(contents, loops-1, card)
  end

  #Controller to pass the client the state it expects
  def client_view(state) do
    %{
      "cards"=> Map.get(state, "cards"),
      "clicks"=> Map.get(state, "clicks"),
      "score"=> calc_score(Map.get(state, "clicks")),
    }
  end

  #Calculate the user's score depending on the number of clicks
  defp calc_score(clicks) do
    if clicks < 25 do
      100
    else
      (25 - clicks)*2 + 100
    end
  end

  def card_clicked(browser_state, index) do
    cards = Map.get(browser_state, "cards")
    clicks = Map.get(browser_state, "clicks")
    clicks = clicks + 1

    flipped = Enum.at(cards, index)
    flipped_letter = Map.get(flipped, "letter")
    flipped_matched = Map.get(flipped, "matched")
    flipped_card = %{
      "letter"=> flipped_letter,
      "flipped"=> true,
      "matched"=> flipped_matched,
    }
    cards = List.replace_at(cards, index, flipped_card)
            |> matches()

    %{ "cards"=> cards, "clicks"=> clicks }
  end

  #Matches flipped cards
  defp matches(cards) do
    num_flipped = Enum.reduce(cards, 0, fn(x, acc) ->
      if x["flipped"] do
        acc + 1
      else
        acc
      end
    end)

    if num_flipped < 2 do
      cards
    else
      idx1 = Enum.find_index(cards, fn(x) -> x["flipped"] end)
      tup1 = List.pop_at(cards, idx1)
      card1 = elem(tup1, 0)
      idx2 = Enum.find_index(elem(tup1, 1), fn(x) -> x["flipped"] end)
      card2 = Enum.at(elem(tup1, 1), idx2)

      if Map.get(card1, "letter") == Map.get(card2, "letter") do
        card1 = %{ card1 | "matched"=> true }
        card2 = %{ card2 | "matched"=> true }
        List.replace_at(elem(tup1, 1), idx2, card2)
        |> List.insert_at(idx1, card1)
        |> Enum.map(fn(x) -> %{ x | "flipped"=> false } end)
      else
        cards
      end
    end
  end

  #Flips all cards over so they can't be seen
  def flip_back(state) do
    cards = Enum.map(Map.get(state, "cards"), fn(x) -> %{ x | "flipped"=> false } end)
    %{ state | "cards"=> cards }
  end
end
