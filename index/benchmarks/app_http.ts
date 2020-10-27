import { IndexService } from "../index_service.ts";
import { serve } from "https://deno.land/std@0.74.0/http/server.ts";
import { dataset } from "./dataset.ts";

const lt = new Map<number, string>();
const s = new IndexService(lt);

for (let i = 0; i < (Deno.args[0] || 1000); i++) {
  dataset.data.children.forEach((child: any) => {
    s.addItem([child.data.title], child.data);
  });
  i++;
}

console.log("Dataset has " + s.getLookupTable().size + " items.");

const deno = serve({ port: 8000 });

console.log("Server started at http://localhost:8000");

for await (const req of deno) {
  const searchTerm = req.url.split("/")[1];
  const results = s.search(searchTerm);
  req.respond({ body: results.size + " record(s) found" });
}
