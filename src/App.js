import "./style.css";
import { useEffect, useState } from "react";
import supabase from "./supabase";

function App() {
  // [state, setState]: when we use setState, state will be treated as argument of this function
  /* 1. define state variable for FORM */
  const [showForm, setShowForm] = useState(false);
  // filter the category when click button
  const [currentCategory, setCurrentCategory] = useState("all");
  // 1. up to date with data, and fetch from supabase
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // 1.2 fetch data from supabase, useEffect will only load data at the beginning
  useEffect(
    function () {
      async function getData() {
        setIsLoading(true);
        // create a query to load data
        let query = supabase.from("facts").select("*");

        if (currentCategory !== "all") {
          query = query.eq("category", currentCategory);
        }
        const { data: facts, error } = await query;
        if (!error) {
          setFacts(facts);
        } else {
          alert("There was a problem with data..");
        }
        setIsLoading(false);
      }
      getData();
      // use dependency array to update data
    },
    [currentCategory]
  );

  return (
    <>
      <Header showForm={showForm} setShowForm={setShowForm} />
      {/* 2. use state variable to SHOW FORM */}
      {showForm ? (
        <FactForm setFacts={setFacts} setShowForm={setShowForm} />
      ) : null}

      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />
        {isLoading ? (
          <Loader />
        ) : (
          <FactList facts={facts} setFacts={setFacts} />
        )}
      </main>
    </>
  );
}

function Loader() {
  return <p className="message">Loading...</p>;
}

const title = "World of my Projects";
function Header({ showForm, setShowForm }) {
  return (
    <header className="header">
      <div className="logo">
        <img id="logo" src="./logo.png" alt="Error" />
        <h1>{title}</h1>
      </div>
      {/* this button use along with the appearing of form */}
      <button
        className="btn btn-large btn-open"
        // 3. update state of variable whenever click button
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Close" : "Public your code"}
      </button>
    </header>
  );
}

/* Color of categories */
const CATEGORIES = [
  { name: "Technology", color: "#3b82f6" },
  { name: "Science", color: "#16a34a" },
  { name: "Finance", color: "#ef4444" },
  { name: "Society", color: "#eab308" },
  { name: "Entertainment", color: "#db2777" },
  { name: "Health", color: "#14b8a6" },
  { name: "History", color: "#f97316" },
  { name: "News", color: "#8b5cf6" },
];

function CategoryFilter({ setCurrentCategory }) {
  /* create button on the LEFT SIDE (aside) to FILTER base on CATEGORY */
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory("all")}
          >
            All
          </button>
        </li>
        {CATEGORIES.map((category) => (
          <CreateCategoryButton
            key={category.name}
            category={category}
            setCurrentCategory={setCurrentCategory}
          />
        ))}
      </ul>
    </aside>
  );
}

function CreateCategoryButton({ category, setCurrentCategory }) {
  return (
    <li className="category">
      <button
        className="btn btn-category"
        style={{ backgroundColor: category.color }}
        onClick={() => setCurrentCategory(category.name)}
      >
        {category.name}
      </button>
    </li>
  );
}

// list of fact
function FactList({ setFacts, facts }) {
  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <FactEntity key={fact.id} fact={fact} setFacts={setFacts} />
        ))}
      </ul>
    </section>
  );
}
// display a fact
function FactEntity({ setFacts, fact }) {
  // voting function
  async function handleVote(voting) {
    // update vote
    const { data, error } = await supabase
      .from("facts")
      .update({ [voting]: fact[voting] + 1 })
      .eq("id", fact.id)
      .select();

    if (!error)
      setFacts((facts) => facts.map((f) => (f.id === fact.id ? data[0] : f)));
  }
  return (
    <li className="fact">
      <p>
        {fact.text}
        <a
          className="source"
          href={fact.source}
          target="_blank"
          rel="noreferrer"
        >
          (Source)
        </a>
      </p>
      <span
        className="tag"
        style={{ backgroundColor: "#3b82f6" }}
        color={{ color: "#eef2ff" }}
      >
        {fact.category}
      </span>
      <div className="vote-buttons">
        <button onClick={() => handleVote("voteInteresting")}>
          👍 {fact.voteInteresting}
        </button>
        <button onClick={() => handleVote("voteMindblowing")}>
          🤯 {fact.voteMindblowing}
        </button>
        <button onClick={() => handleVote("voteFalse")}>
          ⛔️ {fact.voteFalse}
        </button>
      </div>
    </li>
  );
}

// https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

// to public a fact
// only appear when click "share a fact" button
// after click button, text will change into "close"
// use useState() to hide and show form
function FactForm({ setFacts, setShowForm }) {
  // handle input
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const textLength = text.length;
  // only async func have await kw
  async function handleOnSubmit(e) {
    // 1. prevent broswer reload when submit
    e.preventDefault();
    console.log(text, source, category);

    // 2. check if data is valid. create a new fact
    if (text && isValidHttpUrl(source) && category && textLength <= 200) {
      // 3. create new fact, upload to supabase
      // .select() to do after insert, return this row from supabase
      const { data: newFact, error } = await supabase
        .from("facts")
        .insert([{ text, source, category }])
        .select();
      // 4. add new face to UI
      if (!error) setFacts((facts) => [newFact[0], ...facts]);
      // 5. reset input fields
      setText("");
      setSource("");
      setCategory("");
      // 6. close the form
      setShowForm(false);
    }
  }
  return (
    /* 1. onSubmit={handleOnSubmit} sẽ tự động nhận event là đối số */
    /* 2. onSubmit={(e) => handleOnSubmit(e)} phãi truyền đối số vào*/
    <form className="fact-form" onSubmit={handleOnSubmit}>
      <input
        type="text"
        placeholder="Share a fact with the world..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <span>{200 - textLength}</span>
      <input
        type="text"
        placeholder="Trustworthy source..."
        value={source}
        // when text change, it will reload the component
        onChange={(e) => setSource(e.target.value)}
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Choose category:</option>
        {CATEGORIES.map((cat) => (
          <option value={cat.name} key={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-large" type="submit">
        Post
      </button>
    </form>
  );
}
export default App;
