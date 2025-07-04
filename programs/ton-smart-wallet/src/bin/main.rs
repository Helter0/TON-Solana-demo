use std::io::Write;

fn main() {
    let mut stdout = std::io::stdout();
    stdout.write_all(b"ton-smart-wallet program\n").unwrap();
    stdout.flush().unwrap();
}