// /plants/add  Add plant page

import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

export const Route = createFileRoute("/add")({
  component: AddPlantPage,
})

function AddPlantPage() {
  const [name, setName] = useState("")
  const [species, setSpecies] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const plant = {
      name,
      species,
    }

    console.log("New plant:", plant)

    // later → send to backend API
  }

  return (
    <div>
      <h1>Add Plant</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label>Species</label>
          <input
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
          />
        </div>

        <button type="submit">Add Plant</button>
      </form>
    </div>
  )
}