
import { describe, expect, test } from "@jest/globals";

import { sayHello } from "../src/index";


test("sayHello function", () => {
    expect(sayHello("Alice")).toBe("Hello, Alice!");
});

