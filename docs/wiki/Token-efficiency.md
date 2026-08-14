# Token efficiency

AI chats bill you for **everything sitting in the window** — not just the clever answer.

A common mistake is to paste the entire “agent manual” into every turn. That feels thorough. It’s also expensive and noisy.

This harness is built the other way: **load what you need for this step, leave the rest on disk.**

## The kitchen analogy

You don’t put every cookbook on the counter to make eggs.

You open **one recipe**, use the **one pan** you need, cook, put things away, then open the next recipe if dinner has more courses.

That’s progressive disclosure.

## What the agent is asked to load

For a normal turn, roughly:

- The short “map” of the harness (the hub)
- The guide for **this** phase only (specify, or build, or verify…)
- At most one sister guide that phase needs (for example security at verify time)
- The budget rules (don’t drag in sibling features “for orientation”)

Not: all eleven phase guides + every sister skill + last week’s chats + three other features’ specs.

## Why that helps you

**Cheaper** — less text in context means fewer tokens burned per turn.  
Measured from the shipped skill texts: a planning turn can use about **two-thirds less** skill text than dumping the full kit; a typical mid-size feature can use on the order of **~80% less** skill text than reloading everything every turn.

**Clearer** — the model focuses on “finish this job”, not “remember the whole religion”.

**Safer at review time** — Verify is supposed to start **fresh**, so you don’t pay twice for the author’s whole working pile.

## What you should still expect

Progressive loading doesn’t make a bad prompt free.  
Huge diffs, giant logs, and “read the whole repo for vibes” still cost money.

The harness just refuses to be the thing that wastes tokens **by design**.

## How to keep the win

- One feature in focus  
- One phase at a time  
- One task’s files while building  
- Don’t paste the full README into every message if the agent already has the hub installed  

## Next

- How the flow feels → [[How-it-works]]  
- What the brakes do → [[Gates-and-guarantees]]  
- Try it → [[Quick-start]]  
- Back → [[Home]]
