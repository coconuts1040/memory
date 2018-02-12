defmodule MemoryWeb.MemoryChannel do
  use MemoryWeb, :channel

  alias Memory.Game
  alias Memory.Backups

  #Taken from Nat Tuck's lecture notes
  def join("memory:" <> name, payload, socket) do
    game = Backups.load(name) || Game.new()
    socket = socket
    |> assign(:game, game)
    |> assign(:name, name)
    {:ok, %{"join" => name, "game" => Game.client_view(game)}, socket}
  end

  # Pass the click message from the js to the server
  def handle_in("click", payload, socket) do
    new_state = Game.card_clicked(payload["state"], payload["card"])
    Backups.save(socket.assigns[:name], new_state)
    {:reply, {:ok, Game.client_view(new_state)}, socket}
  end

  # Pass the reset message from the js to the server
  def handle_in("reset", payload, socket) do
    new_state = Game.new()
    Backups.save(socket.assigns[:name], new_state)
    {:reply, {:ok, Game.client_view(new_state)}, socket}
  end

  def handle_in("flip-back", payload, socket) do
    new_state = Game.flip_back(payload["state"])
    Backups.save(socket.assigns[:name], new_state)
    {:reply, {:ok, Game.client_view(new_state)}, socket}
  end
end
