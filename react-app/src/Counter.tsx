import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h2>count: {count}</h2>
      <div>
        <button
          style={{ marginRight: '12px' }}
          onClick={() => {
            setCount(count + 1);
          }}
        >
          Increase
        </button>
        <button
          onClick={() => {
            setCount(count - 1);
          }}
        >
          Decrease
        </button>
      </div>
    </>
  );
}

export default Counter;
