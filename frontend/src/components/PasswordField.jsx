import { useState } from 'react'

// A password box with a Show/Hide button, so people can check what they typed.
export default function PasswordField({ id, label = 'Password', value, onChange, autoComplete, placeholder, error }) {
  const [shown, setShown] = useState(false)

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="pw">
        <input
          id={id}
          className={error ? 'input bad' : 'input'}
          type={shown ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
        />
        <button type="button" className="eye" onClick={() => setShown(!shown)} aria-label={shown ? 'Hide password' : 'Show password'}>
          {shown ? 'Hide' : 'Show'}
        </button>
      </div>
      {error && <span className="err">{error}</span>}
    </div>
  )
}
