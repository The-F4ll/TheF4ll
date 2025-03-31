import { Link } from "react-router-dom";
import Button from "../../components/common/Button";

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-gray-900 to-gray-800">
      <h1 className="text-5xl font-bold mb-10 text-center">The F4ll</h1>
      <div className="w-full max-w-md space-y-4">
        <Link to="/join/player" className="block w-full">
          <Button variant="primary" fullWidth>
            Rejoindre en tant que joueur
          </Button>
        </Link>
        <Link to="/join/spectator" className="block w-full">
          <Button variant="secondary" fullWidth>
            Rejoindre en tant que spectateur
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
