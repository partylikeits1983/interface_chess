import { demos } from '#/lib/demos';
import Link from 'next/link';

import { AddressBar } from '#/ui/address-bar';

export default function Page() {
  return (
    <div className="space-y-8">
      <h1 className="font-large text-xl text-gray-300">
        Chess.fish | Chess On The Blockchain
      </h1>

      <ul className="font-small text-gray-300">
        <li>
          Chess.fish allows chess enthusiasts to challenge other players and
          wager any amount of ERC20 tokens.
        </li>

        <br></br>

        <li>
          Chess.fish uses smart contracts to act as a trusted 3rd party and
          enforce the wager conditions agreed upon by both players.
        </li>
        <br></br>

        <li>
          Chess.fish offers a new and exciting way to play chess by harnessing
          the power of the blockchain and smart contracts.
        </li>
      </ul>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/8/89/Stockfish_icon_%282010-2020%29.png"
          alt="Stockfish Icon"
          style={{ maxWidth: '40%', maxHeight: '40%' }}
        />
      </div>

      <div className="space-y-10 text-white">
        {demos.map((section) => {
          return (
            <div key={section.name} className="space-y-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {section.name}
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {section.items.map((item) => {
                  return (
                    <Link
                      href={`/${item.slug}`}
                      key={item.name}
                      className="group block space-y-1.5 rounded-lg bg-gray-900 px-5 py-3 hover:bg-gray-800"
                    >
                      <div className="font-medium text-gray-200 group-hover:text-gray-50">
                        {item.name}
                      </div>

                      {item.description ? (
                        <div className="line-clamp-3 text-sm text-gray-400 group-hover:text-gray-300">
                          {item.description}
                        </div>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
