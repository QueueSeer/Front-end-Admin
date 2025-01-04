import './index.css'; // หรือ './App.css' ถ้าคุณใช้ไฟล์นี้

export default function App() {
  return (
    <div className="min-h-screen bg-yellow-200 flex items-center justify-center">
      <div className="p-8 max-w-md bg-red-500 text-white rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-extrabold underline mb-4">Tailwind CSS</h1>
        <p className="text-lg">
          Tailwind CSS is <span className="text-green-300 font-bold">working</span>!
        </p>
        <button className="mt-6 px-4 py-2 bg-green-500 text-black font-semibold rounded hover:bg-green-700">
          Click Me
        </button>
      </div>
    </div>
  );
}
