import "./topbar.css"

export default function Topbar() {
  return (
    <div className="topbar">
      <header className="header">Habits</header>
      <button className="add-button">
        <i className="bi bi-plus-lg"></i>
      </button>
    </div>
  )
}
