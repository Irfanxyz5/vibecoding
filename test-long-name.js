const test = async () => {
  const longName = "A".repeat(300);
  console.log("Name length:", longName.length);
  
  const response = await fetch("http://localhost:3000/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: longName,
      email: `test_${Date.now()}@example.com`,
      password: "password123"
    })
  });

  console.log("Status:", response.status);
  const data = await response.json().catch(() => null);
  console.log("Response:", data);
};

test();
