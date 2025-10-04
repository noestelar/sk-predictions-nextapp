import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const cutoffTime = await prisma.cutoffTime.findFirst({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ cutoffTime });
    } catch (error) {
        console.error('Error fetching cutoff time:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        console.log('Session:', session); // Debug log

        if (!session) {
            console.log('No session found'); // Debug log
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        console.log('Request body:', body); // Debug log

        const { datetime } = body;
        if (!datetime) {
            console.log('No datetime provided'); // Debug log
            return NextResponse.json(
                { error: 'Datetime is required' },
                { status: 400 }
            );
        }

        try {
            const date = new Date(datetime);
            if (isNaN(date.getTime())) {
                console.log('Invalid date format:', datetime); // Debug log
                return NextResponse.json(
                    { error: 'Invalid datetime format' },
                    { status: 400 }
                );
            }

            console.log('Creating cutoff time with date:', date); // Debug log
            const cutoffTime = await prisma.cutoffTime.create({
                data: {
                    datetime: date,
                },
            });
            console.log('Created cutoff time:', cutoffTime); // Debug log

            return NextResponse.json({ cutoffTime });
        } catch (error) {
            console.error('Error creating cutoff time:', error);
            if (error instanceof Error) {
                return NextResponse.json(
                    { error: `Database error: ${error.message}` },
                    { status: 500 }
                );
            }
            return NextResponse.json(
                { error: 'Failed to create cutoff time' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in POST handler:', error);
        if (error instanceof Error) {
            return NextResponse.json(
                { error: `Server error: ${error.message}` },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 