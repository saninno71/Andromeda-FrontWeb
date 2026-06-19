export function validateLogin(user, pass) {

    console.log ("validador diusparado");

  if (!user.trim()) {
    return "El usuario no puede estar vacío";
  }

  if (user.length > 50 || pass.length > 50) {
    return "Usuario o contraseña demasiado largos";
  }

  return null; // todo OK
}

export async function loginRequest(user, pass) {
  // simulación por ahora
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ok: true, token: "123" });
    }, 1000);
  });

  // 👉 futuro real:
  /*
  const res = await fetch("URL_API", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ user, pass })
  });

  return await res.json();
  */
}