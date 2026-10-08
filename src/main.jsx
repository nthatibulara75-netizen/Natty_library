import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "./styles.css";

const startingBooks = [
  { id: 1, title: "Bophelo ba Lillo", author: "M. Mokoena", genre: "Fiction", isbn: "9781000000011", quantity: 5 },
  { id: 2, title: "My Uncle Grey Bonzo", author: "P. Mofokeng", genre: "Story", isbn: "9781000000028", quantity: 3 },
  { id: 3, title: "C++", author: "J. Smith", genre: "Technology", isbn: "9781000000035", quantity: 1 }
];

const startingUsers = [
  { id: 1, name: "Library Admin", membershipId: "NATTY123", role: "Admin" },
  { id: 2, name: "Nthati Joyce", membershipId: "NATTY002", role: "Member" }
];

function getData(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [books, setBooks] = useState(() => getData("nattyLibraryBooks", startingBooks));
  const [users, setUsers] = useState(() => getData("nattyLibraryUsers", startingUsers));
  const [transactions, setTransactions] = useState(() => getData("nattyLibraryTransactions", []));
  const [loggedIn, setLoggedIn] = useState(() => getData("nattyLibraryLoggedIn", false));

  useEffect(() => localStorage.setItem("nattyLibraryBooks", JSON.stringify(books)), [books]);
  useEffect(() => localStorage.setItem("nattyLibraryUsers", JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem("nattyLibraryTransactions", JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem("nattyLibraryLoggedIn", JSON.stringify(loggedIn)), [loggedIn]);

  const login = (code) => {
    const user = users.find((item) => item.membershipId.toLowerCase() === code.trim().toLowerCase());
    if (user) {
      setLoggedIn(true);
      return { ok: true, message: `Welcome, ${user.name}.` };
    }
    return { ok: false, message: "The login code is not correct." };
  };

  return (
    <Routes>
      <Route path="/login" element={<Login loggedIn={loggedIn} login={login} />} />
      <Route path="/*" element={loggedIn ? <Layout logout={() => setLoggedIn(false)}><Pages books={books} setBooks={setBooks} users={users} setUsers={setUsers} transactions={transactions} setTransactions={setTransactions} /></Layout> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

function Pages({ books, setBooks, users, setUsers, transactions, setTransactions }) {
  return (
    <Routes>
      <Route path="/" element={<Dashboard books={books} users={users} transactions={transactions} />} />
      <Route path="/books" element={<Books books={books} setBooks={setBooks} />} />
      <Route path="/transactions" element={<Transactions books={books} setBooks={setBooks} transactions={transactions} setTransactions={setTransactions} />} />
      <Route path="/users" element={<Users users={users} setUsers={setUsers} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function Layout({ children, logout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const links = [
    { path: "/", label: "Home", icon: "⌂" },
    { path: "/books", label: "Books", icon: "▤" },
    { path: "/transactions", label: "Stock", icon: "↕" },
    { path: "/users", label: "Users", icon: "♙" }
  ];

  return (
    <div className="app">
      <aside className="side">
        <div className="brand">
          <div className="logo">N</div>
          <div><h1>Natty Library</h1><span>Community Library</span></div>
        </div>
        <nav>
          {links.map(link => (
            <button key={link.path} className={location.pathname === link.path ? "nav active" : "nav"} onClick={() => navigate(link.path)}>
              <span>{link.icon}</span>{link.label}
            </button>
          ))}
        </nav>
        <button className="logout" onClick={logout}>Log out</button>
      </aside>
      <main className="main">
        <header className="header">
          <div><small>LIBRARY SYSTEM</small><h2>{getTitle(location.pathname)}</h2></div>
          <div className="ready"><i></i> Ready</div>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}

function getTitle(path) {
  if (path === "/books") return "Books";
  if (path === "/transactions") return "Stock";
  if (path === "/users") return "Users";
  return "Home";
}

function Login({ loggedIn, login }) {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (loggedIn) navigate("/", { replace: true });
  }, [loggedIn, navigate]);

  const submit = e => {
    e.preventDefault();
    const result = login(code);
    setMessage(result.message);
    if (result.ok) navigate("/", { replace: true });
  };

  return (
    <div className="login-screen">
      <div className="login-box">
        <div className="big-logo">N</div>
        <small>WELCOME</small>
        <h1>Natty Library</h1>
        <p>Simple system for managing books, stock and users.</p>
        <form onSubmit={submit}>
          <label>Login code</label>
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="Enter your code" required />
          <button className="main-btn full" type="submit">Log in</button>
        </form>
        {message && <div className="message">{message}</div>}
        <div className="hint"><b>Demo code</b><span>NATTY123</span></div>
      </div>
    </div>
  );
}

function Dashboard({ books, users, transactions }) {
  const copies = books.reduce((total, book) => total + book.quantity, 0);
  const low = books.filter(book => book.quantity < 2);

  return (
    <>
      <div className="intro"><div><h3>Hello, Librarian.</h3><p>Here is the current library information.</p></div><b>{new Date().toLocaleDateString()}</b></div>
      <div className="stats">
        <Stat title="Book titles" value={books.length} icon="▤" />
        <Stat title="Copies" value={copies} icon="◫" />
        <Stat title="Low stock" value={low.length} icon="!" />
        <Stat title="Users" value={users.length} icon="♙" />
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head"><div><h3>Books in stock</h3><p>Books with less than 2 copies are marked.</p></div><b>{books.length}</b></div>
          <BookTable books={books} />
        </section>
        <section className="panel">
          <div className="panel-head"><div><h3>Recent stock</h3><p>Latest changes.</p></div></div>
          {transactions.length === 0 ? <Empty text="No stock changes yet." /> : <div className="activity">{transactions.slice(0, 6).map(item => <div className="activity-row" key={item.id}><strong>{item.type === "Added" ? "+" : "−"}</strong><div><b>{item.bookTitle}</b><span>{item.type}: {item.amount}</span></div></div>)}</div>}
        </section>
      </div>
    </>
  );
}

function Stat({ title, value, icon }) {
  return <div className="stat"><strong>{icon}</strong><div><span>{title}</span><b>{value}</b></div></div>;
}

function BookTable({ books }) {
  if (!books.length) return <Empty text="No books have been added." />;
  return <div className="table-box"><table><thead><tr><th>Title</th><th>Author</th><th>Genre</th><th>ISBN</th><th>Stock</th></tr></thead><tbody>{books.map(book => <tr className={book.quantity < 2 ? "low" : ""} key={book.id}><td><b>{book.title}</b></td><td>{book.author}</td><td>{book.genre}</td><td>{book.isbn}</td><td><span className={book.quantity < 2 ? "stock low-stock" : "stock"}>{book.quantity}</span></td></tr>)}</tbody></table></div>;
}

function Books({ books, setBooks }) {
  const empty = { title: "", author: "", genre: "", isbn: "", quantity: "" };
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  const save = e => {
    e.preventDefault();
    const quantity = Number(form.quantity);
    if (!Number.isInteger(quantity) || quantity < 0) {
      setMessage("Stock must be a whole number of 0 or more.");
      return;
    }
    if (editId) {
      setBooks(list => list.map(book => book.id === editId ? { ...book, ...form, quantity } : book));
      setMessage("Book updated.");
    } else {
      setBooks(list => [...list, { ...form, quantity, id: Date.now() }]);
      setMessage("Book added.");
    }
    setForm(empty);
    setEditId(null);
  };

  const edit = book => {
    setEditId(book.id);
    setForm({ ...book, quantity: String(book.quantity) });
    setMessage("");
  };

  const remove = id => {
    if (window.confirm("Delete this book?")) {
      setBooks(list => list.filter(book => book.id !== id));
      setMessage("Book deleted.");
    }
  };

  return <div className="two">
    <section className="panel form-panel">
      <div className="panel-head"><div><h3>{editId ? "Update book" : "Add book"}</h3><p>Enter simple book details.</p></div></div>
      <form className="form" onSubmit={save}>
        <Input label="Title" name="title" value={form.title} onChange={change} required />
        <Input label="Author" name="author" value={form.author} onChange={change} required />
        <Input label="Genre" name="genre" value={form.genre} onChange={change} required />
        <Input label="ISBN" name="isbn" value={form.isbn} onChange={change} required />
        <Input label="Initial quantity" name="quantity" type="number" min="0" value={form.quantity} onChange={change} required />
        <div className="actions"><button className="main-btn" type="submit">{editId ? "Save" : "Add book"}</button>{editId && <button className="second-btn" type="button" onClick={() => {setEditId(null); setForm(empty);}}>Cancel</button>}</div>
        {message && <div className="message">{message}</div>}
      </form>
    </section>
    <section className="panel">
      <div className="panel-head"><div><h3>All books</h3><p>Update or delete books here.</p></div><b>{books.length}</b></div>
      <div className="book-list">{books.map(book => <div className="book-row" key={book.id}><div className="book-letter">{book.title[0]}</div><div className="book-info"><b>{book.title}</b><span>{book.author}</span><small>{book.genre} · {book.isbn}</small></div><div className="number">{book.quantity}</div><button className="edit" onClick={() => edit(book)}>Update</button><button className="delete" onClick={() => remove(book.id)}>Delete</button></div>)}</div>
    </section>
  </div>;
}

function Transactions({ books, setBooks, transactions, setTransactions }) {
  const [bookId, setBookId] = useState(books[0]?.id || "");
  const [amount, setAmount] = useState(1);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (books.length && !books.some(book => book.id === Number(bookId))) setBookId(books[0].id);
  }, [books, bookId]);

  const move = type => {
    const number = Number(amount);
    const book = books.find(item => item.id === Number(bookId));
    if (!book || !Number.isInteger(number) || number < 1) {
      setMessage("Enter a whole number greater than 0.");
      return;
    }
    if (type === "Deducted" && book.quantity < number) {
      setMessage("There are not enough copies.");
      return;
    }
    setBooks(list => list.map(item => item.id === book.id ? { ...item, quantity: type === "Added" ? item.quantity + number : item.quantity - number } : item));
    setTransactions(list => [{ id: Date.now(), bookTitle: book.title, type, amount: number, time: new Date().toLocaleString() }, ...list]);
    setMessage(type === "Added" ? "Stock added." : "Borrowing saved.");
  };

  return <div className="two">
    <section className="panel form-panel">
      <div className="panel-head"><div><h3>Change stock</h3><p>Add copies or record borrowing.</p></div></div>
      <div className="form">
        <label>Book</label>
        <select value={bookId} onChange={e => setBookId(e.target.value)}>{books.length ? books.map(book => <option value={book.id} key={book.id}>{book.title}</option>) : <option>No books</option>}</select>
        <label>Number of copies</label>
        <input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} />
        <div className="stock-actions"><button className="add" onClick={() => move("Added")} disabled={!books.length}>+ Add stock</button><button className="borrow" onClick={() => move("Deducted")} disabled={!books.length}>− Borrow</button></div>
        {message && <div className="message">{message}</div>}
      </div>
    </section>
    <section className="panel">
      <div className="panel-head"><div><h3>Stock history</h3><p>All stock changes are saved.</p></div><b>{transactions.length}</b></div>
      {transactions.length ? <div className="history">{transactions.map(item => <div className="history-row" key={item.id}><strong>{item.type === "Added" ? "+" : "−"}</strong><div><b>{item.bookTitle}</b><span>{item.type} {item.amount} {item.amount === 1 ? "copy" : "copies"}</span></div><small>{item.time}</small></div>)}</div> : <Empty text="No stock changes yet." />}
    </section>
  </div>;
}

function Users({ users, setUsers }) {
  const empty = { name: "", membershipId: "", role: "Member" };
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  const save = e => {
    e.preventDefault();
    const duplicate = users.some(user => user.membershipId.toLowerCase() === form.membershipId.trim().toLowerCase() && user.id !== editId);
    if (duplicate) {
      setMessage("That login code is already used.");
      return;
    }
    if (editId) {
      setUsers(list => list.map(user => user.id === editId ? { ...user, ...form } : user));
      setMessage("User updated.");
    } else {
      setUsers(list => [...list, { ...form, id: Date.now() }]);
      setMessage("User added.");
    }
    setForm(empty);
    setEditId(null);
  };

  const remove = id => {
    if (users.length === 1) {
      setMessage("One user must remain.");
      return;
    }
    if (window.confirm("Delete this user?")) {
      setUsers(list => list.filter(user => user.id !== id));
      setMessage("User deleted.");
    }
  };

  return <div className="two">
    <section className="panel form-panel">
      <div className="panel-head"><div><h3>{editId ? "Update user" : "Add user"}</h3><p>Add a person who uses the library.</p></div></div>
      <form className="form" onSubmit={save}>
        <Input label="Name" name="name" value={form.name} onChange={change} required />
        <Input label="Login code" name="membershipId" value={form.membershipId} onChange={change} required />
        <label>Role</label>
        <select name="role" value={form.role} onChange={change}><option>Member</option><option>Librarian</option><option>Admin</option></select>
        <div className="actions"><button className="main-btn" type="submit">{editId ? "Save" : "Add user"}</button>{editId && <button className="second-btn" type="button" onClick={() => {setEditId(null); setForm(empty);}}>Cancel</button>}</div>
        {message && <div className="message">{message}</div>}
      </form>
    </section>
    <section className="panel">
      <div className="panel-head"><div><h3>Registered users</h3><p>People saved in the system.</p></div><b>{users.length}</b></div>
      <div className="user-list">{users.map(user => <div className="user-row" key={user.id}><div className="avatar">{user.name[0]}</div><div><b>{user.name}</b><span>{user.membershipId}</span></div><em>{user.role}</em><button className="edit" onClick={() => {setEditId(user.id); setForm({name:user.name,membershipId:user.membershipId,role:user.role});}}>Update</button><button className="delete" onClick={() => remove(user.id)}>Delete</button></div>)}</div>
    </section>
  </div>;
}

function Input({ label, name, value, onChange, type="text", min, required }) {
  return <div><label>{label}</label><input name={name} type={type} min={min} value={value} onChange={onChange} required={required} /></div>;
}

function Empty({ text }) {
  return <div className="empty"><span>◇</span><p>{text}</p></div>;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter><App /></BrowserRouter>
  </React.StrictMode>
);